import { SalesItemController } from './sales-item.controller';
import { SalesItemService } from './sales-item.service';

describe('SalesItemController', () => {
  let controller: SalesItemController;

  beforeEach(() => {
    controller = new SalesItemController(new SalesItemService(undefined as any));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
