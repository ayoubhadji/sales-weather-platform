import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { WeatherCondition } from 'src/common/enums/weather-condition.enum';
import { Repository } from 'typeorm';
import { Weather } from './entities/weather.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WeatherApiService {
  constructor(
    @InjectRepository(Weather)
    private readonly weatherRepository: Repository<Weather>,
    private readonly configService: ConfigService,
  ) {}

  async getCurrentWeather() {
    // const latitude = 36.8065; // Tunis
    // const longitude = 10.1815;

    // const latitude = 33.8076; // Djerba
    // const longitude = 10.8451;
    const latitude = this.configService.get<number>('WEATHER_LATITUDE'); 
    const longitude = this.configService.get<number>('WEATHER_LONGITUDE');

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&current=` +
      `temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code`;

    const response = await axios.get(url);

    const current = response.data.current;

    return {
      weatherDate: current.time,
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      rainfall: current.precipitation,
      windSpeed: current.wind_speed_10m,
      weatherCondition: this.mapWeatherCondition(current.weather_code),
    };
  }

  //Open-Meteo doesn't return weatherCondition Instead it returns a weather code

  private mapWeatherCondition(weatherCode: number): WeatherCondition {
    switch (weatherCode) {
      // Clear sky
      case 0:
        return WeatherCondition.SUNNY;

      // Mainly clear, partly cloudy, overcast
      case 1:
      case 2:
      case 3:
        return WeatherCondition.CLOUDY;

      // Fog
      case 45:
      case 48:
        return WeatherCondition.FOG;

      // Rain
      case 51:
      case 53:
      case 55:
      case 61:
      case 63:
      case 65:
      case 80:
      case 81:
      case 82:
        return WeatherCondition.RAINY;

      // Thunderstorm
      case 95:
      case 96:
      case 99:
        return WeatherCondition.STORM;

      default:
        return WeatherCondition.CLOUDY;
    }
  }

  async importCurrentWeather(): Promise<Weather> {
    const currentWeather = await this.getCurrentWeather();
    // Check if today's weather already exists
    const existingWeather = await this.weatherRepository.findOne({
      where: {
        weatherDate: new Date(currentWeather.weatherDate),
      },
    });

    if (existingWeather) {
      return existingWeather;
    }

    // Create a new weather record
    const weather = this.weatherRepository.create({
      weatherDate: new Date(currentWeather.weatherDate),
      temperature: currentWeather.temperature,
      humidity: currentWeather.humidity,
      rainfall: currentWeather.rainfall,
      windSpeed: currentWeather.windSpeed,
      weatherCondition: currentWeather.weatherCondition,
    });

    const savedWeather = await this.weatherRepository.save(weather);
    return savedWeather;
  }

  // CHANGED: now also requests humidity + wind speed, needed to create a full
  // Weather row for tomorrow (required by the prediction pipeline).
  async getForecast() {

  // const latitude = 33.8076; // Djerba
  // const longitude = 10.8451;
  const latitude = this.configService.get<number>('WEATHER_LATITUDE'); 
  const longitude = this.configService.get<number>('WEATHER_LONGITUDE');

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_max` +
    `&forecast_days=7`;

  const response = await axios.get(url);

  const daily = response.data.daily;

  return daily.time.map((date: string, index: number) => ({
    date,
    maxTemperature: daily.temperature_2m_max[index],
    minTemperature: daily.temperature_2m_min[index],
    rainfall: daily.precipitation_sum[index],
    humidity: daily.relative_humidity_2m_mean[index],
    windSpeed: daily.wind_speed_10m_max[index],
    weatherCondition: this.mapWeatherCondition(
      daily.weather_code[index],
    ),
  }));
}

  // NEW: used by the prediction pipeline to get/create tomorrow's Weather row
  // so SalesPrediction rows have a real weatherId to point to.
  async getOrCreateWeatherForDate(dateStr: string): Promise<Weather> {
    const existing = await this.weatherRepository.findOne({
      where: { weatherDate: new Date(dateStr) },
    });
    if (existing) return existing;

    const forecast = await this.getForecast();
    const entry = forecast.find((f: { date: string }) => f.date === dateStr) ?? forecast[1];

    const weather = this.weatherRepository.create({
      weatherDate: new Date(dateStr),
      temperature: entry.maxTemperature, // daily max used as representative temperature
      humidity: entry.humidity,
      rainfall: entry.rainfall,
      windSpeed: entry.windSpeed,
      weatherCondition: entry.weatherCondition,
    });

    return this.weatherRepository.save(weather);
  }
}