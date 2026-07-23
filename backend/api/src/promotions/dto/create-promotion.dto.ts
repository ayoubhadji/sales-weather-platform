import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  Validate,
} from 'class-validator';
import { IsAfterStartDateConstraint } from '../is-after-start-date.validator';

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
  @Validate(IsAfterStartDateConstraint)
  endDate!: string;
}
