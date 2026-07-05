import { SalesTicketService } from './sales-ticket.service';

describe('SalesTicketService', () => {
  let service: SalesTicketService;

  beforeEach(() => {
    service = new SalesTicketService(undefined as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
