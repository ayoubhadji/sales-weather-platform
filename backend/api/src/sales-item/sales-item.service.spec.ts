import { SalesItemService } from './sales-item.service';

describe('SalesItemService', () => {
  let service: SalesItemService;

  beforeEach(() => {
    service = new SalesItemService(undefined as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
