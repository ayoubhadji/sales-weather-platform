import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SummaryDto {
  @IsNumber()
  revenue!: number;

  @IsNumber()
  tickets!: number;

  @IsNumber()
  averageTicket!: number;

  @IsString()
  topProduct!: string;
}

class RevenuePointDto {
  @IsString()
  date!: string;

  @IsNumber()
  revenue!: number;
}

class CategorySalesDto {
  @IsString()
  category!: string;

  @IsNumber()
  sales!: number;
}

export class GetAiAdviceDto {
  @ValidateNested()
  @Type(() => SummaryDto)
  summary!: SummaryDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RevenuePointDto)
  @IsOptional()
  revenueTrend?: RevenuePointDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategorySalesDto)
  @IsOptional()
  categorySales?: CategorySalesDto[];

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  franchiseName?: string;
}