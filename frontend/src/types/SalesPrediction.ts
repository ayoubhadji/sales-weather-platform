export interface SalesPrediction {
  id: number;
  predictionDate: string;
  predictedQuantity: number;
  predictedRevenue: number;
  confidence: number;

  product: {
    id: number;
    name: string;
  };

  weather: {
    id: number;
    weatherDate: string;
  };
}