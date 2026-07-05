import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(() => {
    service = new ProductsService(undefined as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
