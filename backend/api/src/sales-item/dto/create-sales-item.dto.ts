import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class CreateSalesItemDto {
  @IsInt()
  ticket!: number;

  @IsInt()
  product!: number;

  @IsNumber()
  @IsPositive()
  quantity!: number;
}
