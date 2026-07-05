import { Test, TestingModule } from '@nestjs/testing';
import { SalesPredictionsController } from './sales-predictions.controller';
import { SalesPredictionsService } from './sales-predictions.service';

describe('SalesPredictionsController', () => {
  let controller: SalesPredictionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesPredictionsController],
      providers: [SalesPredictionsService],
    }).compile();

    controller = module.get<SalesPredictionsController>(SalesPredictionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
