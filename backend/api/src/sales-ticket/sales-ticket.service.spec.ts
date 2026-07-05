import { Test, TestingModule } from '@nestjs/testing';
import { SalesTicketService } from './sales-ticket.service';

describe('SalesTicketService', () => {
  let service: SalesTicketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesTicketService],
    }).compile();

    service = module.get<SalesTicketService>(SalesTicketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
