import type { Product } from "@/data/products";

export type StockState = "in_stock" | "low_stock" | "out_of_stock" | "untracked";

export interface StockInfo {
  state: StockState;
  available: number;
  threshold: number;
  label: string;
  /** True when an order would exceed available units (backorder mode). */
  isBackorder: boolean;
}

/**
 * Compute stock state for a product or one of its variants.
 * Pass a `variant` to get variant-specific availability.
 */
export function getStockInfo(
  product: Pick<Product, "stock" | "lowStockThreshold" | "trackInventory">,
  variant?: { stock?: number } | null,
  requestedQty = 0,
): StockInfo {
  const tracked = product.trackInventory ?? typeof product.stock === "number";
  const available =
    variant && typeof variant.stock === "number"
      ? variant.stock
      : (product.stock ?? 0);
  const threshold = product.lowStockThreshold ?? 0;

  if (!tracked) {
    return {
      state: "untracked",
      available: Number.POSITIVE_INFINITY,
      threshold,
      label: "In stock",
      isBackorder: false,
    };
  }

  if (available <= 0) {
    return {
      state: "out_of_stock",
      available: 0,
      threshold,
      label: "Out of stock — backorder available",
      isBackorder: requestedQty > 0,
    };
  }
  if (available <= threshold) {
    return {
      state: "low_stock",
      available,
      threshold,
      label: `Low stock — ${available.toLocaleString()} left`,
      isBackorder: requestedQty > available,
    };
  }
  return {
    state: "in_stock",
    available,
    threshold,
    label: "In stock",
    isBackorder: requestedQty > available,
  };
}
