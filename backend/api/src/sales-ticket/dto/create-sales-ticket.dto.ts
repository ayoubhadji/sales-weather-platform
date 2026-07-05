import { IsDateString, IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateSalesTicketDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  ticketNumber!: string;

  @IsDateString()
  saleDate!: string;

  @IsNumber()
  @IsPositive()
  totalAmount!: number;
}
