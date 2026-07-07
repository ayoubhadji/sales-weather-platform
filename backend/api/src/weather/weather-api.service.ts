import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { WeatherCondition } from 'src/common/enums/weather-condition.enum';

@Injectable()
export class WeatherApiService {

  async getCurrentWeather() {

    const latitude = 36.8065;     // Tunis
    const longitude = 10.1815;

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

}