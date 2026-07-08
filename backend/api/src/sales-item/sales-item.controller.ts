import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SalesItemService } from './sales-item.service';
import { CreateSalesItemDto } from './dto/create-sales-item.dto';
import { UpdateSalesItemDto } from './dto/update-sales-item.dto';

@Controller('sales-item')
export class SalesItemController {
  constructor(private readonly salesItemService: SalesItemService) {}

  @Post()
  create(@Body() createSalesItemDto: CreateSalesItemDto) {
    return this.salesItemService.create(createSalesItemDto);
  }

  @Get()
  findAll() {
    return this.salesItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesItemService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSalesItemDto: UpdateSalesItemDto,
  ) {
    return this.salesItemService.update(+id, updateSalesItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesItemService.remove(+id);
  }
}
