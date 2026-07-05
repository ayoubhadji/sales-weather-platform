import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesItem } from './entities/sales-item.entity';
import { CreateSalesItemDto } from './dto/create-sales-item.dto';
import { UpdateSalesItemDto } from './dto/update-sales-item.dto';
import { Product } from '../products/entities/product.entity';
import { SalesTicket } from '../sales-ticket/entities/sales-ticket.entity';

@Injectable()
export class SalesItemService {
  constructor(
  @InjectRepository(SalesItem)
  private readonly salesItemRepository: Repository<SalesItem>,
  @InjectRepository(Product)
  private readonly productRepository: Repository<Product>,

  @InjectRepository(SalesTicket)
  private readonly salesTicketRepository: Repository<SalesTicket>,
) {}

  async create(createSalesItemDto: CreateSalesItemDto): Promise<SalesItem> {

  // Find the product
  const product = await this.productRepository.findOne({
    where: { id: createSalesItemDto.product },
  });

  if (!product) {
    throw new NotFoundException('Product not found');
  }

  // Find the ticket
  const ticket = await this.salesTicketRepository.findOne({
    where: { id: createSalesItemDto.ticket },
  });

  if (!ticket) {
    throw new NotFoundException('Sales ticket not found');
  }

  // Create the SalesItem
  const salesItem = this.salesItemRepository.create({
    ticket,
    product,
    quantity: createSalesItemDto.quantity,
    unitPrice: Number(product.price),
    subtotal: Number(product.price) * createSalesItemDto.quantity,
  });

  return await this.salesItemRepository.save(salesItem);
}

  async findAll(): Promise<SalesItem[]> {
    return this.salesItemRepository.find();
  }

  async findOne(id: number): Promise<SalesItem> {
    const salesItem = await this.salesItemRepository.findOne({ where: { id } });

    if (!salesItem) {
      throw new NotFoundException(`Sales item with ID ${id} not found.`);
    }

    return salesItem;
  }

  async update(id: number, updateSalesItemDto: UpdateSalesItemDto): Promise<SalesItem> {
    const salesItem = await this.findOne(id);
    Object.assign(salesItem, updateSalesItemDto);
    return this.salesItemRepository.save(salesItem);
  }

  async remove(id: number): Promise<void> {
    const salesItem = await this.findOne(id);
    await this.salesItemRepository.remove(salesItem);
  }
}
