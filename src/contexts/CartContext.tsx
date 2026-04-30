import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  primaryImageUrl: string;
  size: string;
  material: string;
  finish: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  cartTotal: number;
  cartId: string | null;
  addItem: (item: Omit<CartItem, "id" | "lineTotal">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CART_ID_KEY = "mpk_cart";
const CART_ITEMS_KEY = "mpk_cart_items";

const CartContext = createContext<CartContextValue | undefined>(undefined);

function genId() {
  return Math.random().toString(36).slice(2, 11);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let id = window.localStorage.getItem(CART_ID_KEY);
    if (!id) {
      id = genId();
      window.localStorage.setItem(CART_ID_KEY, id);
    }
    setCartId(id);
    try {
      const stored = window.localStorage.getItem(CART_ITEMS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  const addItem: CartContextValue["addItem"] = (input) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (it) =>
          it.productId === input.productId &&
          it.size === input.size &&
          it.material === input.material &&
          it.finish === input.finish,
      );
      if (idx >= 0) {
        const next = [...prev];
        const merged = {
          ...next[idx],
          quantity: next[idx].quantity + input.quantity,
        };
        merged.lineTotal = merged.quantity * merged.unitPrice;
        next[idx] = merged;
        return next;
      }
      return [
        ...prev,
        {
          ...input,
          id: genId(),
          lineTotal: input.quantity * input.unitPrice,
        },
      ];
    });
  };

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const updateQuantity = (id: string, quantity: number) =>
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, quantity, lineTotal: quantity * it.unitPrice }
          : it,
      ),
    );

  const clearCart = () => setItems([]);

  const { itemCount, cartTotal } = useMemo(() => {
    let count = 0;
    let total = 0;
    for (const it of items) {
      count += it.quantity;
      total += it.lineTotal;
    }
    return { itemCount: count, cartTotal: total };
  }, [items]);

  return (
    <CartContext.Provider
      value={{ items, itemCount, cartTotal, cartId, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
