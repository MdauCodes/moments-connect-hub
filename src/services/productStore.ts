// ----------------------------------------------------------------------------
// Mock product store — localStorage-backed CRUD that mirrors the eventual
// Spring Boot REST contract for /api/admin/products. Replace each method
// with a real fetch() call once the backend is live; signatures stay the same.
// ----------------------------------------------------------------------------

import { products as seedProducts, type Product } from "@/data/products";

const STORAGE_KEY = "moments_products_v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readAll(): Product[] {
  if (!isBrowser()) return seedProducts;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedProducts));
      return seedProducts;
    }
    return JSON.parse(raw) as Product[];
  } catch {
    return seedProducts;
  }
}

function writeAll(products: Product[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function uniqueSlug(base: string, products: Product[], ignoreId?: string): string {
  let slug = base || "untitled";
  let n = 2;
  while (products.some((p) => p.slug === slug && p.id !== ignoreId)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export type ProductDraft = Omit<Product, "id" | "slug"> & { slug?: string };

export const productStore = {
  list: async (): Promise<Product[]> => {
    return [...readAll()].sort((a, b) => b.monthlyClicks - a.monthlyClicks);
  },

  getById: async (id: string): Promise<Product | null> => {
    return readAll().find((p) => p.id === id) ?? null;
  },

  create: async (input: ProductDraft): Promise<Product> => {
    const all = readAll();
    const baseSlug = slugify(input.slug || input.name);
    const slug = uniqueSlug(baseSlug, all);
    const product: Product = {
      ...input,
      id: `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      slug,
      images: input.images?.length ? input.images : [input.image],
    };
    writeAll([product, ...all]);
    return product;
  },

  update: async (id: string, patch: Partial<Product>): Promise<Product | null> => {
    const all = readAll();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const current = all[idx];
    const merged: Product = { ...current, ...patch, id: current.id };
    if (patch.slug) {
      merged.slug = uniqueSlug(slugify(patch.slug), all, id);
    } else if (patch.name && patch.name !== current.name && !patch.slug) {
      // Only re-slug if explicitly changed via slug; auto-rename can break links
    }
    if (patch.image && (!patch.images || patch.images.length === 0)) {
      merged.images = [patch.image];
    }
    all[idx] = merged;
    writeAll(all);
    return merged;
  },

  remove: async (id: string): Promise<boolean> => {
    const all = readAll();
    const next = all.filter((p) => p.id !== id);
    if (next.length === all.length) return false;
    writeAll(next);
    return true;
  },

  resetToSeed: async (): Promise<void> => {
    writeAll(seedProducts);
  },
};
