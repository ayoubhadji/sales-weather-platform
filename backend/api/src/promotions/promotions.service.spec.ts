import { PromotionsService } from './promotions.service';

describe('PromotionsService', () => {
  let service: PromotionsService;

  beforeEach(() => {
    service = new PromotionsService(undefined as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
