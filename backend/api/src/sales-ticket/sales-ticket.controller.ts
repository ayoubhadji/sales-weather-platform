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

  // Franchise accounts only ever see their own tickets; Admin sees everyone's.
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    return this.salesTicketService.findAllForUser(req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.salesTicketService.findOneForUser(+id, req.user.id, req.user.role);
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