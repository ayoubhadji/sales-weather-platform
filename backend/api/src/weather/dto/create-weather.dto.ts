import { IsDateString, IsEnum, IsNumber, IsPositive } from 'class-validator';
import { WeatherCondition } from '../../common/enums/weather-condition.enum';

export class CreateWeatherDto {
  @IsDateString()
  weatherDate!: string;

  @IsNumber()
  temperature!: number;

  @IsNumber()
  humidity!: number;

  @IsNumber()
  rainfall!: number;

  @IsNumber()
  windSpeed!: number;

  @IsEnum(WeatherCondition)
  weatherCondition!: WeatherCondition;
}
