import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Alert } from './entities/alert.entity';
import { AlertsSchedulerService } from './alerts.scheduler';
import { WeatherModule } from '../weather/weather.module';

@Module({
  imports: [TypeOrmModule.forFeature([Alert]), WeatherModule],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsSchedulerService],
  // TypeOrmModule was already exported; AlertsService is added so other
  // feature modules (Predictions, Promotions) can inject it to raise
  // alerts automatically.
  exports: [TypeOrmModule, AlertsService],
})
export class AlertsModule {}