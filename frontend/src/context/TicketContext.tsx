import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Product } from "../types/Product";

type TicketItem = {
  product: Product;
  quantity: number;
};

type TicketContextValue = {
  items: TicketItem[];
  addProduct: (product: Product) => void;
  incrementItem: (productId: number) => void;
  decrementItem: (productId: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
};

const TicketContext = createContext<TicketContextValue | undefined>(undefined);

export function TicketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<TicketItem[]>([]);

  const value = useMemo<TicketContextValue>(() => {
    const addProduct = (product: Product) => {
      setItems((currentItems) => {
        const existing = currentItems.find((item) => item.product.id === product.id);

        if (existing) {
          return currentItems.map((item) =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
          );
        }

        return [...currentItems, { product, quantity: 1 }];
      });
    };

    const incrementItem = (productId: number) => {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );
    };

    const decrementItem = (productId: number) => {
      setItems((currentItems) =>
        currentItems
          .map((item) =>
            item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item,
          )
          .filter((item) => item.quantity > 0),
      );
    };

    const removeItem = (productId: number) => {
      setItems((currentItems) => currentItems.filter((item) => item.product.id !== productId));
    };

    const clearCart = () => {
      setItems([]);
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );

    return {
      items,
      addProduct,
      incrementItem,
      decrementItem,
      removeItem,
      clearCart,
      totalItems,
      totalAmount,
    };
  }, [items]);

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
}

export function useTicket() {
  const context = useContext(TicketContext);

  if (!context) {
    throw new Error("useTicket must be used within a TicketProvider");
  }

  return context;
}