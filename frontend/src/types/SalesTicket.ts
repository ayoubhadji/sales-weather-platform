export interface SalesItem {
  id: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;

  product: {
    id: number;
    name: string;
  };
}

export interface SalesTicket {
  id: number;
  ticketNumber: string;
  saleDate: string;
  totalAmount: number;

  items: SalesItem[];
}