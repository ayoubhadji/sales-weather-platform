import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';

describe('PromotionsController', () => {
  let controller: PromotionsController;

  beforeEach(() => {
    controller = new PromotionsController(
      new PromotionsService(undefined as any),
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
