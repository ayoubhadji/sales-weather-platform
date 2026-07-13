import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSalesTicketDto {
  @IsDateString()
  saleDate!: string;

}
