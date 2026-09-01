export interface WasteAvoidanceKPI {
  totalWasteKg: number;
  totalWasteValue: number;
  reductionPercentage: number;
  periodDays: number;
  productsAnalyzed: number;
  forecastAccuracy: number;
}

export interface TimelinePoint {
  date: string;
  wasteAvoidedKg: number;
  wasteAvoidedValue: number;
  itemsCompared: number;
}

export interface ProductBreakdown {
  productId: number;
  productName: string;
  category: string;
  unitPrice: number;
  baselineQuantity: number;
  forecastQuantity: number;
  wasteAvoidedKg: number;
  wasteAvoidedValue: number;
  reductionPercentage: number;
  forecastAccuracy: number;
}
