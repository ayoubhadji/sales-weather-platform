import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AlertsService } from './alerts.service';
import { AlertSeverity } from '../common/enums/alert-severity.enum';
import { AlertType } from '../common/enums/alert-type.enum';
import { WeatherApiService } from '../weather/weather-api.service';
import { WeatherCondition } from '../common/enums/weather-condition.enum';

@Injectable()
export class AlertsSchedulerService {
  private readonly logger = new Logger(AlertsSchedulerService.name);

  constructor(
    private readonly alertsService: AlertsService,
    private readonly weatherApiService: WeatherApiService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledAlert() {
    await this.checkWeatherAnomaly();
  }

  async checkWeatherAnomaly(): Promise<void> {
    try {
      const currentWeather = await this.weatherApiService.getCurrentWeather();
      const severeConditions = [
        WeatherCondition.RAINY,
        WeatherCondition.STORM,
        WeatherCondition.FOG,
        //WeatherCondition.SUNNY,
      ];

      if (!severeConditions.includes(currentWeather.weatherCondition)) {
        return;
      }

      const title = 'Weather anomaly detected';
      const message = `Current conditions are ${currentWeather.weatherCondition.toLowerCase()} with ${currentWeather.rainfall ?? 0}mm rainfall and ${currentWeather.temperature ?? 0}°C.`;

      const result = await this.alertsService.raiseOnce({
        title,
        message,
        severity: AlertSeverity.HIGH,
        type: AlertType.WEATHER,
        dedupeWindowHours: 24,
      });

      if (result) {
        this.logger.log(`Weather alert created: ${result.id}`);
      } else {
        this.logger.log('Weather anomaly alert skipped because a similar alert already exists recently.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Weather anomaly check failed: ${message}`);
    }
  }
}
