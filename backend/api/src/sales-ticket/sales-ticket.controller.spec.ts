import { SalesTicketController } from './sales-ticket.controller';
import { SalesTicketService } from './sales-ticket.service';

describe('SalesTicketController', () => {
  let controller: SalesTicketController;

  beforeEach(() => {
    controller = new SalesTicketController(
      new SalesTicketService(undefined as any),
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
