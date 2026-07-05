import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

describe('WeatherController', () => {
  let controller: WeatherController;

  beforeEach(() => {
    controller = new WeatherController(new WeatherService(undefined as any));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
