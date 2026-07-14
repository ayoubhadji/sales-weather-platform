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
  
    // Implementation for getting report summary
    async getSummary() {
  const revenueResult = await this.ticketRepository
    .createQueryBuilder('ticket')
    .select('SUM(ticket.totalAmount)', 'revenue')
    .addSelect('COUNT(ticket.id)', 'tickets')
    .getRawOne();

  const revenue = Number(revenueResult.revenue ?? 0);

  const tickets = Number(revenueResult.tickets ?? 0);

  const averageTicket =
    tickets > 0 ? Number((revenue / tickets).toFixed(2)) : 0;

    const bestProduct = await this.salesItemRepository
  .createQueryBuilder('item')
  .leftJoin('item.product', 'product')
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
  
}