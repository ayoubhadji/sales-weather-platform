import { Controller, Get } from '@nestjs/common';
import { TrainingDataService } from './training-data.service';
// NOTE: this is internal/technical data meant for the Python training script,
// not the regular frontend. Consider protecting it (API key or admin-only
// guard) before this is ever exposed outside localhost.
@Controller('predictions/training-data')
export class TrainingDataController {
  constructor(private readonly trainingDataService: TrainingDataService) {}

  @Get('revenue')
  async getRevenueTrainingData() {
    return this.trainingDataService.getRevenueTrainingData();
  }

  @Get('demand')
  async getDemandTrainingData() {
    return this.trainingDataService.getDemandTrainingData();
  }
}