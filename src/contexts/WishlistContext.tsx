// ----------------------------------------------------------------------------
// Wishlist — mock-live hybrid.
// Authed users: GET/POST/DELETE /api/v1/customer/wishlist (when backend is up)
// Guests: persisted to localStorage only.
// ----------------------------------------------------------------------------
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { apiUrl } from "@/config/api";
import { authFetch, getAccessToken } from "@/contexts/AuthContext";

const STORAGE_KEY = "mpk_wishlist_v1";

interface WishlistContextValue {
  ids: Set<string>;
  has: (productId: string) => boolean;
  toggle: (productId: string) => Promise<boolean>; // returns new saved state
  remove: (productId: string) => Promise<void>;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}
function write(rows: string[]) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); } catch { /* ignore */ }
}

async function tryLive<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await authFetch(apiUrl(path), init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch { return null; }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  // Hydrate
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = new Set(read());
      if (getAccessToken()) {
        const live = await tryLive<{ productIds: string[] } | string[]>("/api/v1/customer/wishlist");
        if (live && !cancelled) {
          const rows = Array.isArray(live) ? live : live.productIds ?? [];
          rows.forEach((id) => local.add(id));
        }
      }
      if (!cancelled) {
        setIds(local);
        setHydrated(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist
  useEffect(() => {
    if (!hydrated) return;
    write(Array.from(ids));
  }, [ids, hydrated]);

  const toggle = useCallback(async (productId: string): Promise<boolean> => {
    const isSaved = ids.has(productId);
    const next = new Set(ids);
    if (isSaved) next.delete(productId); else next.add(productId);
    setIds(next);
    if (getAccessToken()) {
      await tryLive(`/api/v1/customer/wishlist/${encodeURIComponent(productId)}`, {
        method: isSaved ? "DELETE" : "POST",
      });
    }
    return !isSaved;
  }, [ids]);

  const remove = useCallback(async (productId: string) => {
    const next = new Set(ids);
    next.delete(productId);
    setIds(next);
    if (getAccessToken()) {
      await tryLive(`/api/v1/customer/wishlist/${encodeURIComponent(productId)}`, { method: "DELETE" });
    }
  }, [ids]);

  return (
    <WishlistContext.Provider value={{
      ids,
      has: (id) => ids.has(id),
      toggle,
      remove,
      count: ids.size,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
