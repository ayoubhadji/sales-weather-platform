import { AlertsSchedulerService } from './alerts.scheduler';
import { AlertsService } from './alerts.service';
import { AlertSeverity } from '../common/enums/alert-severity.enum';
import { AlertType } from '../common/enums/alert-type.enum';
import { WeatherApiService } from '../weather/weather-api.service';
import { WeatherCondition } from '../common/enums/weather-condition.enum';

describe('AlertsSchedulerService', () => {
  it('raises a weather anomaly alert when the current weather is severe', async () => {
    const alertsService = {
      raiseOnce: jest.fn().mockResolvedValue({ id: 1 }),
    } as unknown as AlertsService;

    const weatherApiService = {
      getCurrentWeather: jest.fn().mockResolvedValue({
        weatherCondition: WeatherCondition.RAINY,
        rainfall: 23,
        temperature: 18,
      }),
    } as unknown as WeatherApiService;

    const service = new AlertsSchedulerService(alertsService, weatherApiService);

    await service.checkWeatherAnomaly();

    expect(alertsService.raiseOnce).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: AlertSeverity.HIGH,
        type: AlertType.WEATHER,
        title: expect.stringContaining('Weather anomaly'),
      }),
    );
  });
});
