import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Product } from '../products/entities/product.entity';
import { SalesItem } from '../sales-item/entities/sales-item.entity';
import { SalesPrediction } from '../sales-predictions/entities/sales-prediction.entity';
import { Weather } from '../weather/entities/weather.entity';
import { WeatherApiService } from '../weather/weather-api.service';
import { WeatherCondition } from '../common/enums/weather-condition.enum';

// Python ML microservice — falls back to the heuristic below if unreachable,
// untrained, or too unsure of itself.
const ML_SERVICE_URL = process.env.PYTHON_ML_URL ?? 'http://localhost:8000';
const ML_REQUEST_TIMEOUT_MS = 3000;
const MIN_ML_CONFIDENCE_TO_TRUST = 40;

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

// Only suggest a promotion if tomorrow's predicted demand is at least this
// much lower than the product's historical daily average.
const MIN_DROP_PERCENT_FOR_SUGGESTION = 30;
const MIN_SUGGESTED_DISCOUNT = 10;
const MAX_SUGGESTED_DISCOUNT = 40;

export interface ProductPredictionResult {
  productId: number;
  productName: string;
  category: string;
  predictedQuantity: number;
  predictedRevenue: number;
  confidence: number;
  insufficientData: boolean;
  method: 'ml' | 'heuristic';
}

export interface PromotionSuggestion {
  productId: number;
  productName: string;
  category: string;
  currentPrice: number;
  predictedQuantity: number;
  baselineQuantity: number;
  dropPercent: number;
  suggestedDiscount: number;
  reason: string;
}

@Injectable()
export class DemandPredictionService {
  private readonly logger = new Logger(DemandPredictionService.name);

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
  async getOrGenerateTomorrow(forceRegenerate = false): Promise<ProductPredictionResult[]> {
    const tomorrow = this.getTomorrowDateString();

    if (!forceRegenerate) {
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
          method: p.method,
        }));
      }
    }

    return this.generateTomorrowPredictions(tomorrow);
  }

  /**
   * Model 3 — turns tomorrow's per-product demand predictions (Model 2)
   * into promotion recommendations. Only suggests a discount when
   * predicted demand is significantly below the product's own historical
   * average — the idea being: move stock that's expected to sell poorly
   * tomorrow, rather than guessing at "popular" products to discount.
   */
  async suggestPromotions(): Promise<PromotionSuggestion[]> {
    const predictions = await this.getOrGenerateTomorrow();
    const tomorrow = this.getTomorrowDateString();
    const weather = await this.weatherApiService.getOrCreateWeatherForDate(tomorrow);

    const suggestions: PromotionSuggestion[] = [];

    for (const prediction of predictions) {
      // Products with no real sales history yet have nothing meaningful to
      // compare against — skip rather than suggest based on a guessed default.
      if (prediction.insufficientData) continue;

      const { avgQuantityPerDay: baselineQuantity } = await this.computeProductBaseline(
        prediction.productId,
      );
      if (baselineQuantity <= 0) continue;

      const dropPercent = Math.round((1 - prediction.predictedQuantity / baselineQuantity) * 100);
      if (dropPercent < MIN_DROP_PERCENT_FOR_SUGGESTION) continue;

      const product = await this.productRepository.findOne({
        where: { id: prediction.productId },
      });
      if (!product) continue;

      const suggestedDiscount = Math.min(
        MAX_SUGGESTED_DISCOUNT,
        Math.max(MIN_SUGGESTED_DISCOUNT, Math.round(dropPercent / 2)),
      );

      suggestions.push({
        productId: prediction.productId,
        productName: prediction.productName,
        category: prediction.category,
        currentPrice: Number(product.price),
        predictedQuantity: prediction.predictedQuantity,
        baselineQuantity: Math.round(baselineQuantity * 10) / 10,
        dropPercent,
        suggestedDiscount,
        reason: `Predicted demand is ${dropPercent}% below this product's average (${prediction.predictedQuantity} vs ~${Math.round(baselineQuantity)}/day) due to ${weather.weatherCondition} weather tomorrow.`,
      });
    }

    // Biggest expected drop first — the products that need the most help.
    return suggestions.sort((a, b) => b.dropPercent - a.dropPercent);
  }

  private async generateTomorrowPredictions(
    tomorrow: string,
  ): Promise<ProductPredictionResult[]> {
    const weather = await this.weatherApiService.getOrCreateWeatherForDate(tomorrow);
    const products = await this.productRepository.find();

    const results: ProductPredictionResult[] = [];

    for (const product of products) {
      const mlResult = await this.tryMlPrediction(product, weather);

      let predictedQuantity: number;
      let confidence: number;
      let usedFallback: boolean;
      let method: 'ml' | 'heuristic';

      if (mlResult) {
        predictedQuantity = mlResult.quantity;
        confidence = mlResult.confidence;
        usedFallback = false;
        method = 'ml';
        this.logger.log(
          `Used ML prediction for "${product.name}": qty=${predictedQuantity}, confidence=${confidence}`,
        );
      } else {
        const { avgQuantityPerDay, daysUsed } = await this.computeProductBaseline(product.id);
        usedFallback = daysUsed === 0;
        method = 'heuristic';
        const baseline = usedFallback
          ? (DEFAULT_QUANTITY_BY_CATEGORY[product.category] ?? DEFAULT_QUANTITY_FALLBACK)
          : avgQuantityPerDay;

        const multiplier = this.computeMultiplier(
          product.category,
          weather.weatherCondition,
          Number(weather.temperature),
        );

        predictedQuantity = Math.max(0, Math.round(baseline * multiplier));
        confidence = this.computeConfidence(daysUsed);
      }

      const predictedRevenue = Math.round(predictedQuantity * Number(product.price) * 100) / 100;

      const saved = await this.upsertPrediction({
        product,
        weather,
        predictionDate: tomorrow,
        predictedQuantity,
        predictedRevenue,
        confidence,
        method,
      });

      results.push({
        productId: product.id,
        productName: product.name,
        category: product.category,
        predictedQuantity: saved.predictedQuantity,
        predictedRevenue: Number(saved.predictedRevenue),
        confidence: Number(saved.confidence),
        insufficientData: usedFallback,
        method: saved.method,
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
    method: 'ml' | 'heuristic';
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
        method: data.method,
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
      method: data.method,
    });
    return this.salesPredictionRepository.save(created);
  }

  /**
   * Tries the Python ML service for a per-product demand prediction.
   * Returns null (triggering the heuristic fallback) if:
   * - the service is unreachable or times out
   * - it hasn't been trained yet ("not_trained")
   * - it responds but with a confidence below our trust threshold
   */
  private async tryMlPrediction(
    product: Product,
    weather: Weather,
  ): Promise<{ quantity: number; confidence: number } | null> {
    try {
      const response = await axios.post(
        `${ML_SERVICE_URL}/predict/demand`,
        {
          temperature: Number(weather.temperature),
          humidity: Number(weather.humidity),
          rainfall: Number(weather.rainfall),
          windSpeed: Number(weather.windSpeed),
          weatherCondition: weather.weatherCondition,
          productId: product.id,
          category: product.category,
          productName: product.name,
        },
        { timeout: ML_REQUEST_TIMEOUT_MS },
      );

      const data = response.data;

      if (data.status !== 'ok') {
        this.logger.warn(`ML service not ready for "${product.name}" (status: ${data.status})`);
        return null;
      }

      if (data.confidence < MIN_ML_CONFIDENCE_TO_TRUST) {
        this.logger.warn(
          `ML confidence too low for "${product.name}" (${data.confidence}%) — using heuristic instead`,
        );
        return null;
      }

      return { quantity: data.predictedQuantity, confidence: data.confidence };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `ML service unreachable, falling back to heuristic for "${product.name}": ${message}`,
      );
      return null;
    }
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