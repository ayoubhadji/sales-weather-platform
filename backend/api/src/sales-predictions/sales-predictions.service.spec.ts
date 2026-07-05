import { SalesPredictionsService } from './sales-predictions.service';

describe('SalesPredictionsService', () => {
  let service: SalesPredictionsService;

  beforeEach(() => {
    service = new SalesPredictionsService(undefined as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
