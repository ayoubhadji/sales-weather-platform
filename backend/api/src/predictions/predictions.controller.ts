import { Controller, Get, Post, Query } from '@nestjs/common';
import { RevenuePredictionService } from './revenue-prediction.service';
import { DemandPredictionService } from './demand-prediction.service';
import { MlTrainingSchedulerService } from './Ml-training-scheduler.service';

@Controller('predictions')
export class PredictionsController {
  constructor(
    private readonly revenuePredictionService: RevenuePredictionService,
    private readonly demandPredictionService: DemandPredictionService,
    private readonly mlTrainingSchedulerService: MlTrainingSchedulerService,
  ) {}

  // Model 1 — aggregated revenue/ticket estimate for tomorrow
  @Get('tomorrow-revenue')
  async getTomorrowRevenue() {
    return this.revenuePredictionService.predictTomorrow();
  }

  // Model 2 — per-product demand for tomorrow ("what to prepare")
  // ?force=true bypasses the cached predictions and regenerates them
  @Get('tomorrow-demand')
  async getTomorrowDemand(@Query('force') force?: string) {
    return this.demandPredictionService.getOrGenerateTomorrow(force === 'true');
  }

  // Manually trigger the Python model retraining (normally runs
  // automatically every night at 3 AM via the scheduled task).
  @Post('train-now')
  async trainNow() {
    await this.mlTrainingSchedulerService.triggerTraining();
    return { status: 'training triggered, check server logs for results' };
  }
}