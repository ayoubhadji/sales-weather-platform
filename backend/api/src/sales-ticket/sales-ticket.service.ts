import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesTicket } from './entities/sales-ticket.entity';
import { CreateSalesTicketDto } from './dto/create-sales-ticket.dto';
import { UpdateSalesTicketDto } from './dto/update-sales-ticket.dto';

@Injectable()
export class SalesTicketService {
  constructor(
    @InjectRepository(SalesTicket)
    private readonly salesTicketRepository: Repository<SalesTicket>,
  ) {}

  async create(createSalesTicketDto: CreateSalesTicketDto): Promise<SalesTicket> {
    const salesTicket = this.salesTicketRepository.create(createSalesTicketDto);
    return this.salesTicketRepository.save(salesTicket);
  }

  async findAll(): Promise<SalesTicket[]> {
    return this.salesTicketRepository.find({
      relations: {
        items: {
          product: true,
        },
      },
    });
  }

  async findOne(id: number): Promise<SalesTicket> {
  const salesTicket = await this.salesTicketRepository.findOne({
    where: { id },
    relations: {
      items: {
        product: true,
      },
    },
  });

  if (!salesTicket) {
    throw new NotFoundException(
      `Sales ticket with ID ${id} not found.`,
    );
  }

  return salesTicket;
}

  async update(
    id: number,
    updateSalesTicketDto: UpdateSalesTicketDto,
  ): Promise<SalesTicket> {
    const salesTicket = await this.findOne(id);
    Object.assign(salesTicket, updateSalesTicketDto);
    return this.salesTicketRepository.save(salesTicket);
  }

  async remove(id: number): Promise<void> {
    const salesTicket = await this.findOne(id);
    await this.salesTicketRepository.remove(salesTicket);
  }
}
