import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesItem } from '../sales-item/entities/sales-item.entity';
import { SalesPrediction } from '../sales-predictions/entities/sales-prediction.entity';
import { Product } from '../products/entities/product.entity';

interface WasteAvoidanceKPI {
  totalWasteKg: number;
  totalWasteValue: number;
  reductionPercentage: number;
  periodDays: number;
  productsAnalyzed: number;
  forecastAccuracy: number;
}

interface TimelinePoint {
  date: string;
  wasteAvoidedKg: number;
  wasteAvoidedValue: number;
  itemsCompared: number;
}

interface ProductBreakdown {
  productId: number;
  productName: string;
  category: string;
  unitPrice: number;
  baselineQuantity: number;
  forecastQuantity: number;
  wasteAvoidedKg: number;
  wasteAvoidedValue: number;
  reductionPercentage: number;
  forecastAccuracy: number;
}

@Injectable()
export class SustainabilityService {
  private readonly logger = new Logger(SustainabilityService.name);

  constructor(
    @InjectRepository(SalesItem)
    private readonly salesItemRepository: Repository<SalesItem>,

    @InjectRepository(SalesPrediction)
    private readonly salesPredictionRepository: Repository<SalesPrediction>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Calculate waste avoidance KPIs over a date range.
   * Waste avoided = max(0, baseline_quantity - predicted_quantity)
   * 
   * Baseline is calculated as historical average daily sales per product.
   * Waste avoidance estimates how much less would need to be prepared
   * if we used the ML forecast instead of the historical average.
   */
  async calculateWasteAvoidance(
    startDate?: string,
    endDate?: string,
  ): Promise<WasteAvoidanceKPI> {
    // Get all products
    const products = await this.productRepository.find();

    let totalWasteKg = 0;
    let totalWasteValue = 0;
    let productsAnalyzed = 0;
    let totalAccuracy = 0;
    let accuracyCount = 0;

    // Query sales predictions in date range
    const predictionQuery = this.salesPredictionRepository.createQueryBuilder('pred');

    if (startDate) {
      predictionQuery.andWhere('pred.predictionDate >= :startDate', { startDate });
    }

    if (endDate) {
      predictionQuery.andWhere('pred.predictionDate <= :endDate', { endDate });
    }

    const predictions = await predictionQuery
      .leftJoinAndSelect('pred.product', 'product')
      .getMany();

    // Group predictions by product
    const predictionsByProduct = new Map<number, SalesPrediction[]>();
    for (const pred of predictions) {
      if (!predictionsByProduct.has(pred.product.id)) {
        predictionsByProduct.set(pred.product.id, []);
      }
      predictionsByProduct.get(pred.product.id)!.push(pred);
    }

    // Calculate baseline (average) for each product
    const baselinesByProduct = await this.calculateBaselines(startDate, endDate);

    // For each product with predictions, calculate waste avoidance
    for (const [productId, prods] of predictionsByProduct) {
      const baseline = baselinesByProduct.get(productId) ?? 0;
      const product = products.find((p) => p.id === productId);

      if (!product) continue;

      for (const pred of prods) {
        const wasteQuantity = Math.max(0, baseline - pred.predictedQuantity);
        totalWasteKg += wasteQuantity; // Assume 1kg per unit
        totalWasteValue += wasteQuantity * Number(product.price);

        if (pred.confidence > 0) {
          totalAccuracy += Number(pred.confidence);
          accuracyCount++;
        }
      }

      if (baseline > 0) {
        productsAnalyzed++;
      }
    }

    // Calculate period in days
    let periodDays = 0;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      periodDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }

    const avgAccuracy = accuracyCount > 0 ? totalAccuracy / accuracyCount : 0;

    return {
      totalWasteKg: Math.round(totalWasteKg * 100) / 100,
      totalWasteValue: Math.round(totalWasteValue * 100) / 100,
      reductionPercentage: 0, // Will be calculated on frontend if needed
      periodDays,
      productsAnalyzed,
      forecastAccuracy: Math.round(avgAccuracy * 100) / 100,
    };
  }

  /**
   * Get timeline of waste avoidance per day
   */
  async getWasteTimeline(
    startDate?: string,
    endDate?: string,
  ): Promise<TimelinePoint[]> {
    const products = await this.productRepository.find();

    const predictionQuery = this.salesPredictionRepository.createQueryBuilder('pred');

    if (startDate) {
      predictionQuery.andWhere('pred.predictionDate >= :startDate', { startDate });
    }

    if (endDate) {
      predictionQuery.andWhere('pred.predictionDate <= :endDate', { endDate });
    }

    const predictions = await predictionQuery
      .leftJoinAndSelect('pred.product', 'product')
      .orderBy('pred.predictionDate', 'ASC')
      .getMany();

    // Group by date
    const timelineMap = new Map<
      string,
      { wasteKg: number; wasteValue: number; count: number }
    >();

    const baselinesByProduct = await this.calculateBaselines(startDate, endDate);

    for (const pred of predictions) {
      const dateStr = new Date(pred.predictionDate).toISOString().split('T')[0];
      const baseline = baselinesByProduct.get(pred.product.id) ?? 0;
      const wasteQty = Math.max(0, baseline - pred.predictedQuantity);
      const wasteVal = wasteQty * Number(pred.product.price);

      if (!timelineMap.has(dateStr)) {
        timelineMap.set(dateStr, { wasteKg: 0, wasteValue: 0, count: 0 });
      }

      const entry = timelineMap.get(dateStr)!;
      entry.wasteKg += wasteQty;
      entry.wasteValue += wasteVal;
      entry.count++;
    }

    return Array.from(timelineMap.entries()).map(([date, data]) => ({
      date,
      wasteAvoidedKg: Math.round(data.wasteKg * 100) / 100,
      wasteAvoidedValue: Math.round(data.wasteValue * 100) / 100,
      itemsCompared: data.count,
    }));
  }

  /**
   * Get product-level breakdown of waste avoidance
   */
  async getProductBreakdown(
    startDate?: string,
    endDate?: string,
  ): Promise<ProductBreakdown[]> {
    const products = await this.productRepository.find();
    const baselinesByProduct = await this.calculateBaselines(startDate, endDate);

    const predictionQuery = this.salesPredictionRepository.createQueryBuilder('pred');

    if (startDate) {
      predictionQuery.andWhere('pred.predictionDate >= :startDate', { startDate });
    }

    if (endDate) {
      predictionQuery.andWhere('pred.predictionDate <= :endDate', { endDate });
    }

    const predictions = await predictionQuery
      .leftJoinAndSelect('pred.product', 'product')
      .getMany();

    // Group by product
    const statsByProduct = new Map<
      number,
      {
        predictedQty: number;
        totalConfidence: number;
        count: number;
      }
    >();

    for (const pred of predictions) {
      if (!statsByProduct.has(pred.product.id)) {
        statsByProduct.set(pred.product.id, {
          predictedQty: 0,
          totalConfidence: 0,
          count: 0,
        });
      }

      const stats = statsByProduct.get(pred.product.id)!;
      stats.predictedQty += pred.predictedQuantity;
      stats.totalConfidence += Number(pred.confidence);
      stats.count++;
    }

    const breakdown: ProductBreakdown[] = [];

    for (const [productId, stats] of statsByProduct) {
      const product = products.find((p) => p.id === productId);
      if (!product || stats.count === 0) continue;

      const baseline = baselinesByProduct.get(productId) ?? 0;
      const avgPredicted = stats.predictedQty / stats.count;
      const avgConfidence = stats.totalConfidence / stats.count;
      const wasteQty = Math.max(0, baseline - avgPredicted);
      const wasteVal = wasteQty * Number(product.price);
      const reduction = baseline > 0 ? (wasteQty / baseline) * 100 : 0;

      breakdown.push({
        productId: product.id,
        productName: product.name,
        category: product.category,
        unitPrice: Number(product.price),
        baselineQuantity: Math.round(baseline * 100) / 100,
        forecastQuantity: Math.round(avgPredicted * 100) / 100,
        wasteAvoidedKg: Math.round(wasteQty * 100) / 100,
        wasteAvoidedValue: Math.round(wasteVal * 100) / 100,
        reductionPercentage: Math.round(reduction * 100) / 100,
        forecastAccuracy: Math.round(avgConfidence * 100) / 100,
      });
    }

    return breakdown.sort((a, b) => b.wasteAvoidedValue - a.wasteAvoidedValue);
  }

  /**
   * Calculate baseline (historical average) per product
   * Baseline = average daily quantity sold
   */
  private async calculateBaselines(
    startDate?: string,
    endDate?: string,
  ): Promise<Map<number, number>> {
    const query = this.salesItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.product', 'product')
      .leftJoin('item.ticket', 'ticket');

    if (startDate) {
      query.andWhere('ticket.saleDate >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('ticket.saleDate <= :endDate', { endDate });
    }

    const results = await query
      .select('product.id', 'productId')
      .addSelect('AVG(item.quantity)', 'avgQuantity')
      .groupBy('product.id')
      .getRawMany();

    const baselines = new Map<number, number>();
    for (const row of results) {
      baselines.set(Number(row.productId), Number(row.avgQuantity) || 0);
    }

    return baselines;
  }
}
