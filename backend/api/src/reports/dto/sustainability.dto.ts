export class WasteAvoidanceKPIDto {
  totalWasteKg?: number;
  totalWasteValue?: number;
  reductionPercentage?: number;
  periodDays?: number;
  productsAnalyzed?: number;
  forecastAccuracy?: number;
}

export class TimelinePointDto {
  date?: string;
  wasteAvoidedKg?: number;
  wasteAvoidedValue?: number;
  itemsCompared?: number;
}

export class ProductBreakdownDto {
  productId?: number;
  productName?: string;
  category?: string;
  unitPrice?: number;
  baselineQuantity?: number;
  forecastQuantity?: number;
  wasteAvoidedKg?: number;
  wasteAvoidedValue?: number;
  reductionPercentage?: number;
  forecastAccuracy?: number;
}
