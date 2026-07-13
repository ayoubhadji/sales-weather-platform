import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ProductCategory } from '../../common/enums/product-category.enum';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsEnum(ProductCategory)
  category!: ProductCategory;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
