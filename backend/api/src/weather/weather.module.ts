import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Weather } from './entities/weather.entity';
import { WeatherApiService } from './weather-api.service';

@Module({
  imports: [TypeOrmModule.forFeature([Weather])],
  controllers: [WeatherController],
  providers: [WeatherService, WeatherApiService],
  exports: [TypeOrmModule, WeatherApiService], // Export WeatherApiService to be used in PredictionsModule
})
export class WeatherModule {}
