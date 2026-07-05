import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(() => {
    controller = new ProductsController(new ProductsService(undefined as any));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
