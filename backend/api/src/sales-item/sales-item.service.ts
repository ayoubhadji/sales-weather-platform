import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesItem } from './entities/sales-item.entity';
import { CreateSalesItemDto } from './dto/create-sales-item.dto';
import { UpdateSalesItemDto } from './dto/update-sales-item.dto';

@Injectable()
export class SalesItemService {
  constructor(
    @InjectRepository(SalesItem)
    private readonly salesItemRepository: Repository<SalesItem>,
  ) {}

  async create(createSalesItemDto: CreateSalesItemDto): Promise<SalesItem> {
    const salesItem = this.salesItemRepository.create(createSalesItemDto);
    return this.salesItemRepository.save(salesItem);
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
