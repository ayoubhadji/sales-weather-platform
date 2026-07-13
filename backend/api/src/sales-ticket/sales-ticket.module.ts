import { Module } from '@nestjs/common';
import { SalesTicketService } from './sales-ticket.service';
import { SalesTicketController } from './sales-ticket.controller';
import { SalesTicket } from './entities/sales-ticket.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SalesTicket,User])],
  controllers: [SalesTicketController],
  providers: [SalesTicketService],
  exports: [TypeOrmModule],
})
export class SalesTicketModule {}
