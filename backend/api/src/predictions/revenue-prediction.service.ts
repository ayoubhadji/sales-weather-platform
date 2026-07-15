import { Injectable } from '@nestjs/common';
import { DemandPredictionService } from './demand-prediction.service';

export interface RevenuePredictionResult {
  predictionDate: string;
  predictedRevenue: number;
  predictedTickets: number;
  confidence: number;
  method: 'heuristic' | 'ml_model';
  basedOnProducts: number;
}

@Injectable()
export class RevenuePredictionService {
  constructor(private readonly demandPredictionService: DemandPredictionService) {}

  async predictTomorrow(): Promise<RevenuePredictionResult> {
    const tomorrow = this.demandPredictionService.getTomorrowDateString();
    const productPredictions = await this.demandPredictionService.getOrGenerateTomorrow();

    const totalRevenue = productPredictions.reduce((sum, p) => sum + p.predictedRevenue, 0);
    const totalQuantity = productPredictions.reduce((sum, p) => sum + p.predictedQuantity, 0);

    const avgItemsPerTicket = await this.demandPredictionService.computeAvgItemsPerTicket();
    const predictedTickets =
      avgItemsPerTicket > 0 ? Math.round(totalQuantity / avgItemsPerTicket) : 0;

    // Conservative: overall confidence is the weakest link, not the average —
    // one product predicted from zero history should pull the total down.
    const confidence =
      productPredictions.length > 0
        ? Math.min(...productPredictions.map((p) => p.confidence))
        : 25;

    return {
      predictionDate: tomorrow,
      predictedRevenue: Math.round(totalRevenue * 100) / 100,
      predictedTickets,
      confidence,
      method: 'heuristic',
      basedOnProducts: productPredictions.length,
    };
  }
}