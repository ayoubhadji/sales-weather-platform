import { Module } from '@nestjs/common';
import { SalesPredictionsService } from './sales-predictions.service';
import { SalesPredictionsController } from './sales-predictions.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { SalesPrediction } from './entities/sales-prediction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SalesPrediction])],
  controllers: [SalesPredictionsController],
  providers: [SalesPredictionsService],
  exports: [TypeOrmModule],
})
export class SalesPredictionsModule {}
