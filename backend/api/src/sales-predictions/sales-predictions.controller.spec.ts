import { SalesPredictionsController } from './sales-predictions.controller';
import { SalesPredictionsService } from './sales-predictions.service';

describe('SalesPredictionsController', () => {
  let controller: SalesPredictionsController;

  beforeEach(() => {
    controller = new SalesPredictionsController(
      new SalesPredictionsService(undefined as any),
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
