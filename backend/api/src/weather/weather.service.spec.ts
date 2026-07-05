import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  let service: WeatherService;

  beforeEach(() => {
    service = new WeatherService(undefined as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
