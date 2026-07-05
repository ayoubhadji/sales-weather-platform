import { PartialType } from '@nestjs/mapped-types';
import { CreateSalesTicketDto } from './create-sales-ticket.dto';

export class UpdateSalesTicketDto extends PartialType(CreateSalesTicketDto) {}
