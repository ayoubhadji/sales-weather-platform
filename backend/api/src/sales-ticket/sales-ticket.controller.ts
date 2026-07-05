import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SalesTicketService } from './sales-ticket.service';
import { CreateSalesTicketDto } from './dto/create-sales-ticket.dto';
import { UpdateSalesTicketDto } from './dto/update-sales-ticket.dto';

@Controller('sales-ticket')
export class SalesTicketController {
  constructor(private readonly salesTicketService: SalesTicketService) {}

  @Post()
  create(@Body() createSalesTicketDto: CreateSalesTicketDto) {
    return this.salesTicketService.create(createSalesTicketDto);
  }

  @Get()
  findAll() {
    return this.salesTicketService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesTicketService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSalesTicketDto: UpdateSalesTicketDto) {
    return this.salesTicketService.update(+id, updateSalesTicketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesTicketService.remove(+id);
  }
}
