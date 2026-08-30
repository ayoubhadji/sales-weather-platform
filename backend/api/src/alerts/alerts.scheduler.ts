import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import { AlertsService } from './alerts.service';
import { AlertSeverity } from '../common/enums/alert-severity.enum';
import { AlertType } from '../common/enums/alert-type.enum';
import { WeatherApiService } from '../weather/weather-api.service';
import { WeatherCondition } from '../common/enums/weather-condition.enum';
import { Product } from '../products/entities/product.entity';
import { Promotion } from '../promotions/entities/promotion.entity';
import { SalesTicket } from '../sales-ticket/entities/sales-ticket.entity';
import { SalesItem } from '../sales-item/entities/sales-item.entity';

@Injectable()
export class AlertsSchedulerService {
  private readonly logger = new Logger(AlertsSchedulerService.name);

  constructor(
    private readonly alertsService: AlertsService,
    private readonly weatherApiService: WeatherApiService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(SalesTicket)
    private readonly salesTicketRepository: Repository<SalesTicket>,
    @InjectRepository(SalesItem)
    private readonly salesItemRepository: Repository<SalesItem>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleScheduledAlert() {
    await Promise.all([
      this.checkWeatherAnomaly(),
      this.checkSalesAnomaly(),
      this.checkPromotionWarning(),
      this.checkProductStaleness(),
    ]);
  }

  private async raiseAlert(
    title: string,
    message: string,
    severity: AlertSeverity,
    type: AlertType,
  ): Promise<void> {
    const result = await this.alertsService.raiseOnce({
      title,
      message,
      severity,
      type,
      dedupeWindowHours: 24,
    });

    if (result) {
      this.logger.log(`Alert created [${type}/${severity}] -> ${result.id}: ${title}`);
    } else {
      this.logger.log(`Skipped duplicate alert: ${title}`);
    }
  }

  async checkWeatherAnomaly(): Promise<void> {
    try {
      const currentWeather = await this.weatherApiService.getCurrentWeather();
      const severeConditions = [
        WeatherCondition.RAINY,
        WeatherCondition.STORM,
        WeatherCondition.FOG,
      ];

      if (!severeConditions.includes(currentWeather.weatherCondition)) {
        return;
      }

      await this.raiseAlert(
        'Weather anomaly detected',
        `Current conditions are ${currentWeather.weatherCondition.toLowerCase()} with ${currentWeather.rainfall ?? 0}mm rainfall and ${currentWeather.temperature ?? 0}°C.`,
        AlertSeverity.HIGH,
        AlertType.WEATHER,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Weather anomaly check failed: ${message}`);
    }
  }

  async checkSalesAnomaly(): Promise<void> {
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentSales = await this.salesTicketRepository.count({
        where: { saleDate: MoreThan(since) },
      });

      if (recentSales > 0) {
        return;
      }

      await this.raiseAlert(
        'Sales anomaly detected',
        'No sales tickets were recorded in the last 24 hours. Revenue may have dropped unexpectedly.',
        AlertSeverity.HIGH,
        AlertType.SALES,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Sales anomaly check failed: ${message}`);
    }
  }

  async checkPromotionWarning(): Promise<void> {
    try {
      const promotions = await this.promotionRepository.find({
        relations: { product: true },
      });

      const expiringSoon = promotions.filter((promotion) => {
        if (!promotion.endDate || promotion.applied) return false;
        const endDate = new Date(promotion.endDate).getTime();
        const now = Date.now();
        return endDate <= now + 2 * 24 * 60 * 60 * 1000;
      });

      if (expiringSoon.length === 0) {
        return;
      }

      const promotion = expiringSoon[0];
      const productName = promotion.product?.name ?? 'product';

      await this.raiseAlert(
        `Promotion expiring soon: ${productName}`,
        `The promotion for ${productName} ends soon. Consider extending or reactivating it.`,
        AlertSeverity.MEDIUM,
        AlertType.PROMOTION,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Promotion warning check failed: ${message}`);
    }
  }

  async checkProductStaleness(): Promise<void> {
    try {
      const products = await this.productRepository.find();
      const salesItems = await this.salesItemRepository.find({
        relations: { ticket: true, product: true },
      });

      const activeProductIds = new Set(
        salesItems
          .filter((item) => {
            const saleDate = item.ticket?.saleDate;
            if (!saleDate) return false;
            const diffMs = Date.now() - new Date(saleDate).getTime();
            return diffMs <= 30 * 24 * 60 * 60 * 1000;
          })
          .map((item) => item.product?.id),
      );

      const staleProduct = products.find((product) => !activeProductIds.has(product.id));
      if (!staleProduct) {
        return;
      }

      await this.raiseAlert(
        'Product staleness detected',
        `Product ${staleProduct.name} has not had recent sales activity in the last 30 days.`,
        AlertSeverity.MEDIUM,
        AlertType.PRODUCT,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Product staleness check failed: ${message}`);
    }
  }
}
