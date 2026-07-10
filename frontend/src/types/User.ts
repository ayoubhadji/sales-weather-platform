export interface User {
  id: number;
  name: string;
  email: string;
  city: string;
  address: string;
  phone: string;
  role: "ADMIN" | "FRANCHISE";
  isActive: boolean;
}