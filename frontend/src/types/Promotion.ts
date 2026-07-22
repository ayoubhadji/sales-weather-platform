import type { Product } from "./Product";

export interface Promotion {
  id: number;
  product: Product;
  discountPercentage: number;
  reason: string;
  startDate: string;
  endDate: string;
  applied: boolean;
  originalPrice: number | null;
}