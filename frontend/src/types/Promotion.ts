export interface Promotion {
  id: number;
  product: {
    id: number;
    name: string;
  };
  discountPercentage: number;
  reason: string;
  startDate: string;
  endDate: string;
}