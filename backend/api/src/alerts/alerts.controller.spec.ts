import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';

describe('AlertsController', () => {
  let controller: AlertsController;

  beforeEach(() => {
    controller = new AlertsController(new AlertsService(undefined as any));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
