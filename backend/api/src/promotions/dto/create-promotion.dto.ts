import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePromotionDto {
  @IsNumber()
  @IsPositive()
  productId!: number;

  @IsNumber()
  @IsPositive()
  discountPercentage!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  reason!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}
