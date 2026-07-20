import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';

const ML_SERVICE_URL = process.env.PYTHON_ML_URL ?? 'http://localhost:8000';
const TRAIN_TIMEOUT_MS = 30000; // training can take longer than a normal request

@Injectable()
export class MlTrainingSchedulerService {
  private readonly logger = new Logger(MlTrainingSchedulerService.name);

  // Runs every day at 3:00 AM — after the day's sales are closed out,
  // well before the next day's predictions are generated.
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleScheduledTraining() {
    this.logger.log('Scheduled ML training starting...');
    await this.triggerTraining();
  }

  /**
   * Extracted so it can also be called manually (e.g. from an admin
   * endpoint) without duplicating logic.
   */
  async triggerTraining(): Promise<void> {
    try {
      const response = await axios.post(
        `${ML_SERVICE_URL}/train`,
        {},
        { timeout: TRAIN_TIMEOUT_MS },
      );

      const { revenue, demand } = response.data;

      this.logger.log(
        `Training done — revenue: ${revenue.status} (${revenue.samplesUsed ?? revenue.samplesFound ?? 0} samples), ` +
          `demand: ${demand.status} (${demand.samplesUsed ?? demand.samplesFound ?? 0} samples)`,
      );

      if (demand.status === 'trained') {
        this.logger.log(
          `Demand model metrics — linear: R²=${demand.metrics.linear_regression.r2} MAE=${demand.metrics.linear_regression.mae}, ` +
            `forest: R²=${demand.metrics.random_forest.r2} MAE=${demand.metrics.random_forest.mae}`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Scheduled ML training failed (service may be offline): ${message}`);
    }
  }
}