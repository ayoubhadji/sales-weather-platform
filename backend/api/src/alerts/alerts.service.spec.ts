import { AlertsService } from './alerts.service';

describe('AlertsService', () => {
  let service: AlertsService;

  beforeEach(() => {
    service = new AlertsService(undefined as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
