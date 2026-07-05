import { Test, TestingModule } from '@nestjs/testing';
import { SalesTicketController } from './sales-ticket.controller';
import { SalesTicketService } from './sales-ticket.service';

describe('SalesTicketController', () => {
  let controller: SalesTicketController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesTicketController],
      providers: [SalesTicketService],
    }).compile();

    controller = module.get<SalesTicketController>(SalesTicketController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
