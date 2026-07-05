import { Injectable } from '@nestjs/common';
import { CreateSalesPredictionDto } from './dto/create-sales-prediction.dto';
import { UpdateSalesPredictionDto } from './dto/update-sales-prediction.dto';

@Injectable()
export class SalesPredictionsService {
  create(createSalesPredictionDto: CreateSalesPredictionDto) {
    return 'This action adds a new salesPrediction';
  }

  findAll() {
    return `This action returns all salesPredictions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} salesPrediction`;
  }

  update(id: number, updateSalesPredictionDto: UpdateSalesPredictionDto) {
    return `This action updates a #${id} salesPrediction`;
  }

  remove(id: number) {
    return `This action removes a #${id} salesPrediction`;
  }
}
