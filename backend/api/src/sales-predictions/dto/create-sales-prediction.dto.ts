import { IsDateString, IsNumber, IsPositive } from 'class-validator';

export class CreateSalesPredictionDto {
  @IsNumber()
  @IsPositive()
  productId!: number;

  @IsNumber()
  @IsPositive()
  weatherId!: number;

  @IsDateString()
  predictionDate!: string;

  @IsNumber()
  @IsPositive()
  predictedQuantity!: number;

  @IsNumber()
  confidence!: number;

  @IsNumber()
  @IsPositive()
  predictedRevenue!: number;
}
