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

  //return await this.salesItemRepository.save(salesItem);

  const savedItem = await this.salesItemRepository.save(salesItem);

// Recalculate the ticket total
await this.updateTicketTotal(ticket.id);

return savedItem;
  
}

  async findAll(): Promise<SalesItem[]> {
    return this.salesItemRepository.find();
  }

  async findOne(id: number): Promise<SalesItem> {
    //const salesItem = await this.salesItemRepository.findOne({ where: { id } });
    const salesItem = await this.salesItemRepository.findOne({
    where: { id },
    relations: {
      ticket: true,
      product: true,
    },
  });

    if (!salesItem) {
      throw new NotFoundException(`Sales item with ID ${id} not found.`);
    }

    return salesItem;
  }

async update(
  id: number,
  updateSalesItemDto: UpdateSalesItemDto,
): Promise<SalesItem> {

  const salesItem = await this.findOne(id);

  // If quantity changes, recalculate subtotal
  if (updateSalesItemDto.quantity !== undefined) {
    salesItem.quantity = updateSalesItemDto.quantity;
    salesItem.subtotal =
      Number(salesItem.unitPrice) * salesItem.quantity;
  }

  const updatedItem = await this.salesItemRepository.save(salesItem);

  // Update the ticket total
  await this.updateTicketTotal(salesItem.ticket.id);

  return updatedItem;
}

  async remove(id: number): Promise<void> {
    const salesItem = await this.findOne(id);

    const ticketId = salesItem.ticket.id;

    await this.salesItemRepository.remove(salesItem);

    // Recalculate ticket total
    await this.updateTicketTotal(ticketId);
  }

  private async updateTicketTotal(ticketId: number): Promise<void> {
  // Get all items belonging to the ticket
  const items = await this.salesItemRepository.find({
    where: {
      ticket: {
        id: ticketId,
      },
    },
  });

  // Calculate the total amount
  const total = items.reduce(
    (sum, item) => sum + Number(item.subtotal),
    0,
  );

  // Load the ticket
  const ticket = await this.salesTicketRepository.findOne({
    where: { id: ticketId },
  });

  if (!ticket) {
    throw new NotFoundException('Sales ticket not found');
  }

  // Update the total
  ticket.totalAmount = total;

  // Save
  await this.salesTicketRepository.save(ticket);
}
}
