import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface BasketItem {
  productId: string;
  name: string;
  image: string;
  qty: number;
  size: string;
  finish: string;
  moq: number;
}

interface BasketContextValue {
  items: BasketItem[];
  add: (item: BasketItem) => void;
  remove: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  updateSize: (productId: string, size: string) => void;
  updateFinish: (productId: string, finish: string) => void;
  clear: () => void;
  isInBasket: (productId: string) => boolean;
  count: number;
}

const STORAGE_KEY = "moments_basket";

const BasketContext = createContext<BasketContextValue | undefined>(undefined);

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as BasketItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, hydrated]);

  const add = (item: BasketItem) => {
    setItems((prev) => (prev.some((i) => i.productId === item.productId) ? prev : [...prev, item]));
  };

  const remove = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, qty } : i)));
  };

  const updateSize = (productId: string, size: string) => {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, size } : i)));
  };

  const updateFinish = (productId: string, finish: string) => {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, finish } : i)));
  };

  const clear = () => setItems([]);

  const isInBasket = (productId: string) => items.some((i) => i.productId === productId);

  return (
    <BasketContext.Provider
      value={{
        items,
        add,
        remove,
        updateQty,
        updateSize,
        updateFinish,
        clear,
        isInBasket,
        count: items.length,
      }}
    >
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) {
    throw new Error("useBasket must be used within a BasketProvider");
  }
  return ctx;
}
