import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesTicket } from './entities/sales-ticket.entity';
import { CreateSalesTicketDto } from './dto/create-sales-ticket.dto';
import { UpdateSalesTicketDto } from './dto/update-sales-ticket.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SalesTicketService {
  constructor(
    @InjectRepository(SalesTicket)
    private readonly salesTicketRepository: Repository<SalesTicket>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    
  ) {}

    async create(
  createSalesTicketDto: CreateSalesTicketDto,
  userId: number,
): Promise<SalesTicket> {

    // Find the franchise
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Franchise not found');
    }

    // Find the last created ticket
    const lastTicket = await this.salesTicketRepository.find({
      order: {
        id: 'DESC',
      },
      take: 1,
    });

    let nextNumber = 1;

    if (lastTicket.length > 0) {
      nextNumber = lastTicket[0].id + 1;
    }

    const ticketNumber = `TK${String(nextNumber).padStart(6, '0')}`;

    const salesTicket = this.salesTicketRepository.create({
      ticketNumber,
      saleDate: createSalesTicketDto.saleDate,
      totalAmount: 0,
      user, // 👈 Link ticket to the franchise
    });

    return await this.salesTicketRepository.save(salesTicket);
  }

  async findAll(): Promise<SalesTicket[]> {
    return this.salesTicketRepository.find({
      relations: {
        user: true,
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
        user: true,
        items: {
          product: true,
        },
      },
    });

    if (!salesTicket) {
      throw new NotFoundException(`Sales ticket with ID ${id} not found.`);
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
