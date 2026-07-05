import { Test, TestingModule } from '@nestjs/testing';
import { SalesPredictionsService } from './sales-predictions.service';

describe('SalesPredictionsService', () => {
  let service: SalesPredictionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesPredictionsService],
    }).compile();

    service = module.get<SalesPredictionsService>(SalesPredictionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
