import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Weather } from './entities/weather.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Weather])],
  controllers: [WeatherController],
  providers: [WeatherService],
  exports: [TypeOrmModule],
  
})
export class WeatherModule {}
