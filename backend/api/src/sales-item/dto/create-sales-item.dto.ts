import { IsNumber, IsPositive } from 'class-validator';

export class CreateSalesItemDto {
  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsNumber()
  @IsPositive()
  unitPrice!: number;

  @IsNumber()
  @IsPositive()
  subtotal!: number;
}
