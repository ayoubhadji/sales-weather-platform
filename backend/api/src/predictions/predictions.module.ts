import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { SalesItem } from '../sales-item/entities/sales-item.entity';
import { SalesTicket } from '../sales-ticket/entities/sales-ticket.entity';
import { SalesPrediction } from '../sales-predictions/entities/sales-prediction.entity';
import { Weather } from '../weather/entities/weather.entity';
import { WeatherModule } from '../weather/weather.module';
import { PredictionsController } from './predictions.controller';
import { TrainingDataController } from './training-data.controller';
import { RevenuePredictionService } from './revenue-prediction.service';
import { DemandPredictionService } from './demand-prediction.service';
import { TrainingDataService } from './training-data.service';
import { MlTrainingSchedulerService } from './Ml-training-scheduler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, SalesItem, SalesTicket, SalesPrediction, Weather]),
    WeatherModule, // must export WeatherApiService
  ],
  controllers: [PredictionsController, TrainingDataController],
  providers: [
    RevenuePredictionService,
    DemandPredictionService,
    TrainingDataService,
    MlTrainingSchedulerService,
  ],
})
export class PredictionsModule {}