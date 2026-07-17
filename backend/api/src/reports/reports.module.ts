import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { GroqAdvisorService } from './Groq-advisor.service';

import { SalesTicket } from '../sales-ticket/entities/sales-ticket.entity';
import { SalesItem } from '../sales-item/entities/sales-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalesTicket,
      SalesItem,
      Product,
      User,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, GroqAdvisorService],
})
export class ReportsModule {}