import { Test, TestingModule } from '@nestjs/testing';
import { SalesItemService } from './sales-item.service';

describe('SalesItemService', () => {
  let service: SalesItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesItemService],
    }).compile();

    service = module.get<SalesItemService>(SalesItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
