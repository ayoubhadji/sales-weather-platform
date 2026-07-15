import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesTicket } from '../sales-ticket/entities/sales-ticket.entity';
import { SalesItem } from '../sales-item/entities/sales-item.entity';
import { Weather } from '../weather/entities/weather.entity';
import { WeatherCondition } from '../common/enums/weather-condition.enum';

export interface RevenueTrainingRow {
  date: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  weatherCondition: WeatherCondition;
  totalRevenue: number;
  ticketCount: number;
}

export interface DemandTrainingRow {
  date: string;
  productId: number;
  productName: string;
  category: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  weatherCondition: WeatherCondition;
  quantitySold: number;
}

@Injectable()
export class TrainingDataService {
  constructor(
    @InjectRepository(SalesTicket)
    private readonly salesTicketRepository: Repository<SalesTicket>,
    @InjectRepository(SalesItem)
    private readonly salesItemRepository: Repository<SalesItem>,
    @InjectRepository(Weather)
    private readonly weatherRepository: Repository<Weather>,
  ) {}

  private toDateKey(date: Date | string): string {
    return new Date(date).toISOString().split('T')[0];
  }

  private async getWeatherByDateMap(): Promise<Map<string, Weather>> {
    const weatherRecords = await this.weatherRepository.find();
    const map = new Map<string, Weather>();
    for (const w of weatherRecords) {
      map.set(this.toDateKey(w.weatherDate), w);
    }
    return map;
  }

  /**
   * One row per day: total revenue + ticket count, joined with that day's
   * weather. Days with no matching weather record are skipped — a training
   * example needs its features (weather) to be usable.
   */
  async getRevenueTrainingData(): Promise<RevenueTrainingRow[]> {
    const tickets = await this.salesTicketRepository.find();
    const weatherByDate = await this.getWeatherByDateMap();

    const byDay = new Map<string, { revenue: number; count: number }>();
    for (const ticket of tickets) {
      const day = this.toDateKey(ticket.saleDate);
      const entry = byDay.get(day) ?? { revenue: 0, count: 0 };
      entry.revenue += Number(ticket.totalAmount);
      entry.count += 1;
      byDay.set(day, entry);
    }

    const rows: RevenueTrainingRow[] = [];
    for (const [day, agg] of byDay.entries()) {
      const weather = weatherByDate.get(day);
      if (!weather) continue;

      rows.push({
        date: day,
        temperature: Number(weather.temperature),
        humidity: Number(weather.humidity),
        rainfall: Number(weather.rainfall),
        windSpeed: Number(weather.windSpeed),
        weatherCondition: weather.weatherCondition,
        totalRevenue: Math.round(agg.revenue * 100) / 100,
        ticketCount: agg.count,
      });
    }

    return rows.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * One row per (day, product): quantity sold that day, joined with that
   * day's weather. Same skip-if-no-weather rule as above.
   */
  async getDemandTrainingData(): Promise<DemandTrainingRow[]> {
    const raw = await this.salesItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.ticket', 'ticket')
      .innerJoin('item.product', 'product')
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('product.category', 'category')
      .addSelect('ticket.saleDate', 'saleDate')
      .addSelect('item.quantity', 'quantity')
      .getRawMany<{
        productId: number;
        productName: string;
        category: string;
        saleDate: Date;
        quantity: number;
      }>();

    const weatherByDate = await this.getWeatherByDateMap();

    const byProductDay = new Map<
      string,
      { productId: number; productName: string; category: string; day: string; quantity: number }
    >();

    for (const item of raw) {
      const day = this.toDateKey(item.saleDate);
      const key = `${item.productId}_${day}`;
      const entry = byProductDay.get(key) ?? {
        productId: item.productId,
        productName: item.productName,
        category: item.category,
        day,
        quantity: 0,
      };
      entry.quantity += Number(item.quantity);
      byProductDay.set(key, entry);
    }

    const rows: DemandTrainingRow[] = [];
    for (const entry of byProductDay.values()) {
      const weather = weatherByDate.get(entry.day);
      if (!weather) continue;

      rows.push({
        date: entry.day,
        productId: entry.productId,
        productName: entry.productName,
        category: entry.category,
        temperature: Number(weather.temperature),
        humidity: Number(weather.humidity),
        rainfall: Number(weather.rainfall),
        windSpeed: Number(weather.windSpeed),
        weatherCondition: weather.weatherCondition,
        quantitySold: entry.quantity,
      });
    }

    return rows.sort((a, b) => a.date.localeCompare(b.date) || a.productId - b.productId);
  }
}