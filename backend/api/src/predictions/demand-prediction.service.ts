import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { SalesItem } from '../sales-item/entities/sales-item.entity';
import { SalesPrediction } from '../sales-predictions/entities/sales-prediction.entity';
import { Weather } from '../weather/entities/weather.entity';
import { WeatherApiService } from '../weather/weather-api.service';
import { WeatherCondition } from '../common/enums/weather-condition.enum';

// Base multiplier per weather condition (same spirit as Model 1's baseline).
const CONDITION_MULTIPLIER: Record<WeatherCondition, number> = {
  [WeatherCondition.SUNNY]: 1.2,
  [WeatherCondition.CLOUDY]: 1.0,
  [WeatherCondition.FOG]: 0.85,
  [WeatherCondition.RAINY]: 0.75,
  [WeatherCondition.STORM]: 0.5,
};

// How much each product category reacts to hot (>=32°C) or cold (<=12°C) days.
// Positive = demand goes up, negative = demand goes down. This is a starting
// heuristic — replace with learned coefficients once there's enough history.
const CATEGORY_HOT_ADJUSTMENT: Record<string, number> = {
  COLD_DRINK: 0.35,
  DESSERT: 0.3,
  SNACK: 0.15,
  FOOD: 0.1,
  FAST_FOOD: 0.1,
  HOT_DRINK: -0.25,
};

const CATEGORY_COLD_ADJUSTMENT: Record<string, number> = {
  HOT_DRINK: 0.3,
  COLD_DRINK: -0.2,
  DESSERT: -0.1,
  SNACK: 0,
  FOOD: 0,
  FAST_FOOD: 0,
};

// Fallback average daily quantity for a product with no sales history at all yet.
const DEFAULT_QUANTITY_BY_CATEGORY: Record<string, number> = {
  FOOD: 15,
  FAST_FOOD: 18,
  HOT_DRINK: 12,
  COLD_DRINK: 20,
  DESSERT: 10,
  SNACK: 14,
};
const DEFAULT_QUANTITY_FALLBACK = 12;

export interface ProductPredictionResult {
  productId: number;
  productName: string;
  category: string;
  predictedQuantity: number;
  predictedRevenue: number;
  confidence: number;
  insufficientData: boolean;
}

@Injectable()
export class DemandPredictionService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(SalesItem)
    private readonly salesItemRepository: Repository<SalesItem>,
    @InjectRepository(SalesPrediction)
    private readonly salesPredictionRepository: Repository<SalesPrediction>,
    private readonly weatherApiService: WeatherApiService,
  ) {}

  getTomorrowDateString(): string {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  }

  /**
   * Returns tomorrow's per-product predictions, generating and persisting
   * them first if they don't already exist for that date.
   */
  async getOrGenerateTomorrow(): Promise<ProductPredictionResult[]> {
    const tomorrow = this.getTomorrowDateString();

    const existing = await this.salesPredictionRepository.find({
      where: { predictionDate: new Date(tomorrow) },
      relations: { product: true },
    });

    if (existing.length > 0) {
      return existing.map((p) => ({
        productId: p.product.id,
        productName: p.product.name,
        category: p.product.category,
        predictedQuantity: p.predictedQuantity,
        predictedRevenue: Number(p.predictedRevenue),
        confidence: Number(p.confidence),
        insufficientData: Number(p.confidence) < 50,
      }));
    }

    return this.generateTomorrowPredictions(tomorrow);
  }

  private async generateTomorrowPredictions(
    tomorrow: string,
  ): Promise<ProductPredictionResult[]> {
    const weather = await this.weatherApiService.getOrCreateWeatherForDate(tomorrow);
    const products = await this.productRepository.find();

    const results: ProductPredictionResult[] = [];

    for (const product of products) {
      const { avgQuantityPerDay, daysUsed } = await this.computeProductBaseline(product.id);
      const usedFallback = daysUsed === 0;
      const baseline = usedFallback
        ? (DEFAULT_QUANTITY_BY_CATEGORY[product.category] ?? DEFAULT_QUANTITY_FALLBACK)
        : avgQuantityPerDay;

      const multiplier = this.computeMultiplier(
        product.category,
        weather.weatherCondition,
        Number(weather.temperature),
      );

      const predictedQuantity = Math.max(0, Math.round(baseline * multiplier));
      const predictedRevenue = Math.round(predictedQuantity * Number(product.price) * 100) / 100;
      const confidence = this.computeConfidence(daysUsed);

      const saved = await this.upsertPrediction({
        product,
        weather,
        predictionDate: tomorrow,
        predictedQuantity,
        predictedRevenue,
        confidence,
      });

      results.push({
        productId: product.id,
        productName: product.name,
        category: product.category,
        predictedQuantity: saved.predictedQuantity,
        predictedRevenue: Number(saved.predictedRevenue),
        confidence: Number(saved.confidence),
        insufficientData: usedFallback,
      });
    }

    return results;
  }

  private async upsertPrediction(data: {
    product: Product;
    weather: Weather;
    predictionDate: string;
    predictedQuantity: number;
    predictedRevenue: number;
    confidence: number;
  }): Promise<SalesPrediction> {
    const existing = await this.salesPredictionRepository.findOne({
      where: {
        product: { id: data.product.id },
        predictionDate: new Date(data.predictionDate),
      },
    });

    if (existing) {
      Object.assign(existing, {
        weather: data.weather,
        predictedQuantity: data.predictedQuantity,
        predictedRevenue: data.predictedRevenue,
        confidence: data.confidence,
      });
      return this.salesPredictionRepository.save(existing);
    }

    const created = this.salesPredictionRepository.create({
      product: data.product,
      weather: data.weather,
      predictionDate: new Date(data.predictionDate) as unknown as Date,
      predictedQuantity: data.predictedQuantity,
      predictedRevenue: data.predictedRevenue,
      confidence: data.confidence,
    });
    return this.salesPredictionRepository.save(created);
  }

  private async computeProductBaseline(
    productId: number,
  ): Promise<{ avgQuantityPerDay: number; daysUsed: number }> {
    const items = await this.salesItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.product', 'product')
      .innerJoin('item.ticket', 'ticket')
      .where('product.id = :productId', { productId })
      .select('item.quantity', 'quantity')
      .addSelect('ticket.saleDate', 'saleDate')
      .getRawMany<{ quantity: number; saleDate: Date }>();

    if (items.length === 0) {
      return { avgQuantityPerDay: 0, daysUsed: 0 };
    }

    const quantityByDay = new Map<string, number>();
    for (const item of items) {
      const day = new Date(item.saleDate).toISOString().split('T')[0];
      quantityByDay.set(day, (quantityByDay.get(day) ?? 0) + Number(item.quantity));
    }

    const totalQuantity = [...quantityByDay.values()].reduce((sum, v) => sum + v, 0);
    return {
      avgQuantityPerDay: totalQuantity / quantityByDay.size,
      daysUsed: quantityByDay.size,
    };
  }

  private computeMultiplier(
    category: string,
    condition: WeatherCondition,
    temperature: number,
  ): number {
    let multiplier = CONDITION_MULTIPLIER[condition] ?? 1;

    if (temperature >= 32) {
      multiplier += CATEGORY_HOT_ADJUSTMENT[category] ?? 0;
    } else if (temperature <= 12) {
      multiplier += CATEGORY_COLD_ADJUSTMENT[category] ?? 0;
    }

    return Math.max(0.2, Math.round(multiplier * 100) / 100);
  }

  private computeConfidence(daysUsed: number): number {
    if (daysUsed === 0) return 25;
    let confidence = 40 + Math.min(daysUsed, 40);
    return Math.min(confidence, 85);
  }

  /**
   * Average number of items per ticket historically — used by Model 1 to
   * turn a total predicted quantity into an estimated ticket count.
   */
  async computeAvgItemsPerTicket(): Promise<number> {
    const raw = await this.salesItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.ticket', 'ticket')
      .select('ticket.id', 'ticketId')
      .addSelect('SUM(item.quantity)', 'totalQuantity')
      .groupBy('ticket.id')
      .getRawMany<{ ticketId: number; totalQuantity: string }>();

    if (raw.length === 0) return 3; // sensible default until there's history

    const total = raw.reduce((sum, r) => sum + Number(r.totalQuantity), 0);
    return total / raw.length;
  }
}