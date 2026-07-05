import { Test, TestingModule } from '@nestjs/testing';
import { SalesItemController } from './sales-item.controller';
import { SalesItemService } from './sales-item.service';

describe('SalesItemController', () => {
  let controller: SalesItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesItemController],
      providers: [SalesItemService],
    }).compile();

    controller = module.get<SalesItemController>(SalesItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
