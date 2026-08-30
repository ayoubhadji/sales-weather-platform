export interface Alert {
  id: number;
  title: string;
  message: string;
  severity: string;
  type: "WEATHER" | "ML" | "PROMOTION" | "SALES" | "PRODUCT" | "SYSTEM";
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
}