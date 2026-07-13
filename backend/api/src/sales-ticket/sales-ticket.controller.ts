import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SalesTicketService } from './sales-ticket.service';
import { CreateSalesTicketDto } from './dto/create-sales-ticket.dto';
import { UpdateSalesTicketDto } from './dto/update-sales-ticket.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('sales-ticket')
export class SalesTicketController {
  constructor(private readonly salesTicketService: SalesTicketService) {}

 @UseGuards(JwtAuthGuard)
@Post()
create(
  @Body() createSalesTicketDto: CreateSalesTicketDto,
  @Request() req,
) {
  return this.salesTicketService.create(
    createSalesTicketDto,
    req.user.id,
  );
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
  update(
    @Param('id') id: string,
    @Body() updateSalesTicketDto: UpdateSalesTicketDto,
  ) {
    return this.salesTicketService.update(+id, updateSalesTicketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesTicketService.remove(+id);
  }
}
