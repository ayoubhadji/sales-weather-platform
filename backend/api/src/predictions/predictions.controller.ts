import { Controller, Get } from '@nestjs/common';
import { RevenuePredictionService } from './revenue-prediction.service';
import { DemandPredictionService } from './demand-prediction.service';

@Controller('predictions')
export class PredictionsController {
  constructor(
    private readonly revenuePredictionService: RevenuePredictionService,
    private readonly demandPredictionService: DemandPredictionService,
  ) {}

  // Model 1 — aggregated revenue/ticket estimate for tomorrow
  @Get('tomorrow-revenue')
  async getTomorrowRevenue() {
    return this.revenuePredictionService.predictTomorrow();
  }

  // Model 2 — per-product demand for tomorrow ("what to prepare")
  @Get('tomorrow-demand')
  async getTomorrowDemand() {
    return this.demandPredictionService.getOrGenerateTomorrow();
  }
}