import { PartialType } from '@nestjs/mapped-types';
import { CreateSalesPredictionDto } from './create-sales-prediction.dto';

export class UpdateSalesPredictionDto extends PartialType(
  CreateSalesPredictionDto,
) {}
