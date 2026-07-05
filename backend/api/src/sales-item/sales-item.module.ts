import { Module } from '@nestjs/common';
import { SalesItemService } from './sales-item.service';
import { SalesItemController } from './sales-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { SalesItem } from './entities/sales-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SalesItem])],
  controllers: [SalesItemController],
  providers: [SalesItemService],
  exports: [TypeOrmModule],
})
export class SalesItemModule {}
