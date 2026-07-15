import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SalesTicket } from '../sales-ticket/entities/sales-ticket.entity';
import { SalesItem } from '../sales-item/entities/sales-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(SalesTicket)
    private readonly ticketRepository: Repository<SalesTicket>,

    @InjectRepository(SalesItem)
    private readonly salesItemRepository: Repository<SalesItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getSummary(
    startDate?: string,
    endDate?: string,
    franchiseId?: number,
  ) {
    const revenueQuery = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoin('ticket.user', 'user');

    if (startDate) {
      revenueQuery.andWhere(
        'ticket.saleDate >= :startDate',
        {
          startDate,
        },
      );
    }

    if (endDate) {
      revenueQuery.andWhere(
        'ticket.saleDate <= :endDate',
        {
          endDate,
        },
      );
    }

    if (franchiseId) {
      revenueQuery.andWhere(
        'user.id = :franchiseId',
        {
          franchiseId,
        },
      );
    }

    const revenueResult = await revenueQuery
      .select('SUM(ticket.totalAmount)', 'revenue')
      .addSelect('COUNT(ticket.id)', 'tickets')
      .getRawOne();

    const revenue = Number(revenueResult.revenue ?? 0);

    const tickets = Number(revenueResult.tickets ?? 0);

    const averageTicket =
      tickets > 0
        ? Number((revenue / tickets).toFixed(2))
        : 0;

    const bestProductQuery = this.salesItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.product', 'product')
      .leftJoin('item.ticket', 'ticket')
      .leftJoin('ticket.user', 'user');

    if (startDate) {
      bestProductQuery.andWhere(
        'ticket.saleDate >= :startDate',
        {
          startDate,
        },
      );
    }

    if (endDate) {
      bestProductQuery.andWhere(
        'ticket.saleDate <= :endDate',
        {
          endDate,
        },
      );
    }

    if (franchiseId) {
      bestProductQuery.andWhere(
        'user.id = :franchiseId',
        {
          franchiseId,
        },
      );
    }

    const bestProduct = await bestProductQuery
      .select('product.name', 'name')
      .addSelect('SUM(item.quantity)', 'totalSold')
      .groupBy('product.id')
      .orderBy('totalSold', 'DESC')
      .limit(1)
      .getRawOne();

    return {
      revenue,
      tickets,
      averageTicket,
      topProduct: bestProduct?.name ?? 'N/A',
    };
  }

  async getRevenueTrend(
  startDate?: string,
  endDate?: string,
  franchiseId?: number,
) {
  const query = this.ticketRepository
    .createQueryBuilder('ticket')
    .leftJoin('ticket.user', 'user');

  if (startDate) {
    query.andWhere(
      'ticket.saleDate >= :startDate',
      { startDate },
    );
  }

  if (endDate) {
    query.andWhere(
      'ticket.saleDate <= :endDate',
      { endDate },
    );
  }

  if (franchiseId) {
    query.andWhere(
      'user.id = :franchiseId',
      { franchiseId },
    );
  }

  const result = await query
    .select("DATE(ticket.saleDate)", "date")
    .addSelect("SUM(ticket.totalAmount)", "revenue")
    .groupBy("DATE(ticket.saleDate)")
    .orderBy("DATE(ticket.saleDate)", "ASC")
    .getRawMany();

  return result.map((item) => ({
    date: item.date,
    revenue: Number(item.revenue),
  }));
}
}