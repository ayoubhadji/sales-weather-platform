import type { Product } from "./Product";
import type { Weather } from "./Weather";

export interface SalesPrediction {
  id: number;
  predictionDate: string;
  predictedQuantity: number;
  predictedRevenue: number;
  confidence: number;

  product: Product;
  weather: Weather;
}