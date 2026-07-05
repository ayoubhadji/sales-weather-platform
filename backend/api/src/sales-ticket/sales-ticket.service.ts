import { Injectable } from '@nestjs/common';
import { CreateSalesTicketDto } from './dto/create-sales-ticket.dto';
import { UpdateSalesTicketDto } from './dto/update-sales-ticket.dto';

@Injectable()
export class SalesTicketService {
  create(createSalesTicketDto: CreateSalesTicketDto) {
    return 'This action adds a new salesTicket';
  }

  findAll() {
    return `This action returns all salesTicket`;
  }

  findOne(id: number) {
    return `This action returns a #${id} salesTicket`;
  }

  update(id: number, updateSalesTicketDto: UpdateSalesTicketDto) {
    return `This action updates a #${id} salesTicket`;
  }

  remove(id: number) {
    return `This action removes a #${id} salesTicket`;
  }
}
