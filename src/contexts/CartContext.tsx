import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { apiFetch } from "@/config/api";

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
  /** Optional variant selection — present when product has variants. */
  variantId?: string;
  variantLabel?: string;
  sku?: string;
  /** True when the line was placed beyond available stock. */
  isBackorder?: boolean;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  cartTotal: number;
  cartId: string | null;
  cartLoading: boolean;
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

/** Best-effort normalization of a backend cart payload into CartItem[]. */
function parseBackendCart(data: unknown): CartItem[] | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  const rawItems = (obj.items ?? obj.lineItems ?? obj.cartItems) as unknown;
  if (!Array.isArray(rawItems)) return null;
  const items: CartItem[] = [];
  for (const r of rawItems) {
    if (!r || typeof r !== "object") continue;
    const it = r as Record<string, any>;
    const quantity = Number(it.quantity ?? it.qty ?? 0);
    const unitPrice = Number(it.unitPrice ?? it.price ?? 0);
    items.push({
      id: String(it.id ?? it.itemId ?? genId()),
      productId: String(it.productId ?? it.product?.id ?? ""),
      productName: String(it.productName ?? it.product?.name ?? ""),
      primaryImageUrl: String(it.primaryImageUrl ?? it.product?.primaryImageUrl ?? it.imageUrl ?? ""),
      size: String(it.size ?? ""),
      material: String(it.material ?? ""),
      finish: String(it.finish ?? ""),
      quantity,
      unitPrice,
      lineTotal: Number(it.lineTotal ?? quantity * unitPrice),
      variantId: it.variantId ?? undefined,
      variantLabel: it.variantLabel ?? undefined,
      sku: it.sku ?? undefined,
      isBackorder: it.isBackorder ?? undefined,
    });
  }
  return items;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);

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

    // Hydrate from backend (best-effort, non-blocking)
    void (async () => {
      try {
        const res = await apiFetch("/api/v1/cart", { session: true, auth: true });
        if (!res.ok) return;
        const data = await res.json();
        const parsed = parseBackendCart(data);
        if (parsed) setItems(parsed);
      } catch {
        /* keep local state */
      } finally {
        setCartLoading(false);
      }
    })();
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
          (it.variantId ?? "") === (input.variantId ?? "") &&
          it.size === input.size &&
          it.material === input.material &&
          it.finish === input.finish,
      );
      if (idx >= 0) {
        const next = [...prev];
        const merged = { ...next[idx], quantity: next[idx].quantity + input.quantity };
        merged.lineTotal = merged.quantity * merged.unitPrice;
        next[idx] = merged;
        return next;
      }
      return [
        ...prev,
        { ...input, id: genId(), lineTotal: input.quantity * input.unitPrice },
      ];
    });
    // Sync to backend (best-effort)
    void apiFetch("/api/v1/cart/items", {
      method: "POST",
      session: true,
      auth: true,
      json: {
        productId: input.productId,
        variantId: input.variantId,
        quantity: input.quantity,
        size: input.size,
        material: input.material,
        finish: input.finish,
        unitPrice: input.unitPrice,
      },
    }).catch(() => { /* keep local cart even if backend rejects */ });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    void (async () => {
      try {
        const res = await apiFetch(`/api/v1/cart/items/${encodeURIComponent(id)}`, {
          method: "DELETE",
          session: true,
          auth: true,
        });
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        const parsed = parseBackendCart(data);
        if (parsed) setItems(parsed);
      } catch {
        /* keep local state */
      }
    })();
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, quantity, lineTotal: quantity * it.unitPrice }
          : it,
      ),
    );
    void (async () => {
      try {
        const res = await apiFetch(`/api/v1/cart/items/${encodeURIComponent(id)}`, {
          method: "PUT",
          session: true,
          auth: true,
          json: { quantity },
        });
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        const parsed = parseBackendCart(data);
        if (parsed) setItems(parsed);
      } catch {
        /* keep local state */
      }
    })();
  };

  const clearCart = () => {
    setItems([]);
    void apiFetch("/api/v1/cart", {
      method: "DELETE",
      session: true,
      auth: true,
    }).catch(() => { /* keep local clear */ });
  };

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
