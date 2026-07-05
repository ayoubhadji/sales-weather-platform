import { Injectable } from '@nestjs/common';
import { CreateSalesItemDto } from './dto/create-sales-item.dto';
import { UpdateSalesItemDto } from './dto/update-sales-item.dto';

@Injectable()
export class SalesItemService {
  create(createSalesItemDto: CreateSalesItemDto) {
    return 'This action adds a new salesItem';
  }

  findAll() {
    return `This action returns all salesItem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} salesItem`;
  }

  update(id: number, updateSalesItemDto: UpdateSalesItemDto) {
    return `This action updates a #${id} salesItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} salesItem`;
  }
}
