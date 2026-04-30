import { products, industries } from "@/data/products";
import { blogStore } from "@/services/blogStore";
import { searchProducts as rankSearch } from "@/services/search";
import { API_BASE_URL, apiUrl } from "@/config/api";
import type { Product, Industry } from "@/data/products";
import type { Blog, BlogStatus, BlogTemplate } from "@/data/blogs";

const USE_MOCKS = import.meta.env.VITE_USE_MOCK_DATA === "true";

type PageResponse<T> = { content: T[] };
type ProductApiDto = Partial<Product> & {
  id: string;
  slug: string;
  name: string;
  primaryImageUrl?: string;
  imageUrls?: string[];
  industries?: Array<{ id?: string | number; displayId?: string | number; slug?: string }>;
};

function qs(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path));
  if (!res.ok) throw new Error(`API request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

function normalizeIndustryIds(p: ProductApiDto): string[] {
  if (p.industryIds?.length) return p.industryIds.map(String);
  return (p.industries ?? [])
    .map((industry) => industry.id ?? industry.displayId ?? industries.find((i) => i.slug === industry.slug)?.id)
    .filter((id): id is string | number => id !== undefined && id !== null)
    .map(String);
}

function normalizeProduct(p: ProductApiDto): Product {
  const image = p.image ?? p.primaryImageUrl ?? p.imageUrls?.[0] ?? "";
  return {
    ...p,
    category: p.category ?? "bags",
    description: p.description ?? "",
    moq: p.moq ?? 1,
    image,
    images: p.images ?? p.imageUrls ?? (image ? [image] : []),
    isDiscount: p.isDiscount ?? false,
    isNewArrival: p.isNewArrival ?? false,
    isFastMoving: p.isFastMoving ?? false,
    tags: p.tags ?? [],
    sizes: p.sizes ?? [],
    industryIds: normalizeIndustryIds(p),
    totalClicks: p.totalClicks ?? 0,
    monthlyClicks: p.monthlyClicks ?? 0,
    totalEnquiries: p.totalEnquiries ?? 0,
    monthlyEnquiries: p.monthlyEnquiries ?? 0,
  };
}

const iconBySlug = new Map(industries.map((industry) => [industry.slug, industry.icon]));

function normalizeIndustry(industry: Partial<Industry> & { displayId?: number }): Industry {
  const fallback = industries.find((i) => i.slug === industry.slug || i.id === industry.id);
  return {
    id: industry.id ?? fallback?.id ?? String(industry.displayId ?? ""),
    name: industry.name ?? fallback?.name ?? "Industry",
    slug: industry.slug ?? fallback?.slug ?? "industry",
    icon: fallback?.icon ?? iconBySlug.get(industry.slug ?? "") ?? industries[0].icon,
    description: industry.description ?? fallback?.description ?? "",
    tagline: industry.tagline ?? fallback?.tagline,
    keywords: industry.keywords ?? fallback?.keywords ?? [],
  };
}

export const api = {
  // TODO: GET /api/config
  getConfig: async () => ({
    blogsEnabled: true,
    emailCaptureEnabled: true,
  }),

  // TODO: GET /api/blogs?status=published
  getBlogs: async (params?: {
    status?: BlogStatus;
    template?: BlogTemplate;
    limit?: number;
  }): Promise<Blog[]> => blogStore.list(params),

  // TODO: GET /api/blogs/{slug}
  getBlogBySlug: async (slug: string): Promise<Blog | null> =>
    blogStore.getBySlug(slug),

  // TODO: GET /api/blogs/latest?limit=3 (published only)
  getLatestBlogs: async (limit = 3): Promise<Blog[]> =>
    blogStore.list({ status: "published", limit }),

  // TODO: GET /api/blogs/{slug}/related?limit=2
  getRelatedBlogs: async (excludeSlug: string, limit = 2): Promise<Blog[]> => {
    const all = await blogStore.list({ status: "published" });
    const others = all.filter((b) => b.slug !== excludeSlug);
    // Shuffle deterministically-ish then slice
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }
    return others.slice(0, limit);
  },

  // GET /api/v1/public/products
  getProducts: async (params?: {
    industryId?: string;
    industryIds?: string[];
    isDiscount?: boolean;
    isNewArrival?: boolean;
    isFastMoving?: boolean;
    category?: string;
    page?: number;
    size?: number;
    sort?: string;
  }) => {
    if (!USE_MOCKS && API_BASE_URL) {
      const flat: Record<string, string | number | boolean | undefined> = {
        industryId: params?.industryId,
        isDiscount: params?.isDiscount,
        isNewArrival: params?.isNewArrival,
        isFastMoving: params?.isFastMoving,
        category: params?.category,
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        sort: params?.sort ?? "createdAt,desc",
      };
      // Multi-industry support: backend accepts repeated industryId params
      const search = new URLSearchParams();
      Object.entries(flat).forEach(([k, v]) => {
        if (v !== undefined && v !== "") search.set(k, String(v));
      });
      if (params?.industryIds?.length) {
        params.industryIds.forEach((id) => search.append("industryId", id));
      }
      const data = await getJson<PageResponse<Product> | Product[]>(
        `/api/v1/public/products?${search.toString()}`,
      );
      return (Array.isArray(data) ? data : data.content).map(normalizeProduct);
    }
    let result = [...products];
    if (params?.industryId) result = result.filter((p) => p.industryIds.includes(params.industryId!));
    if (params?.industryIds?.length) {
      const set = new Set(params.industryIds);
      result = result.filter((p) => p.industryIds.some((id) => set.has(id)));
    }
    if (params?.isDiscount) result = result.filter((p) => p.isDiscount);
    if (params?.isNewArrival) result = result.filter((p) => p.isNewArrival);
    if (params?.isFastMoving) result = result.filter((p) => p.isFastMoving);
    if (params?.category) {
      const c = params.category.toLowerCase();
      result = result.filter((p) => p.category.toLowerCase().includes(c));
    }
    return result;
  },

  // GET /api/v1/public/products/search?q=&limit=
  searchProducts: async (q: string, limit?: number) => {
    if (!q || q.trim().length < 2) return [];
    if (!USE_MOCKS && API_BASE_URL) {
      const data = await getJson<Product[]>(
        `/api/v1/public/products/search${qs({ q: q.trim(), limit })}`,
      );
      return data.map(normalizeProduct);
    }
    return rankSearch(products, q, limit);
  },

  // GET /api/v1/public/products/recommended
  getRecommended: async () => {
    if (!USE_MOCKS && API_BASE_URL) {
      const data = await getJson<Product[]>("/api/v1/public/products/recommended");
      return data.map(normalizeProduct);
    }
    return [...products].sort((a, b) => b.monthlyClicks - a.monthlyClicks).slice(0, 4);
  },

  // GET /api/v1/public/industries
  getIndustries: async () => {
    if (!USE_MOCKS && API_BASE_URL) {
      const data = await getJson<Array<Partial<Industry> & { displayId?: number }>>(
        "/api/v1/public/industries",
      );
      return data.map(normalizeIndustry);
    }
    return industries;
  },

  // GET /api/v1/public/products/{slug}
  getProductBySlug: async (slug: string): Promise<Product | null> => {
    if (!USE_MOCKS && API_BASE_URL) {
      try {
        const data = await getJson<Product>(`/api/v1/public/products/${encodeURIComponent(slug)}`);
        return normalizeProduct(data);
      } catch {
        return null;
      }
    }
    return products.find((p) => p.slug === slug) ?? null;
  },

  // POST /api/v1/public/enquiries
  submitEnquiry: async (payload: unknown) => {
    if (!USE_MOCKS && API_BASE_URL) {
      const res = await fetch(apiUrl("/api/v1/public/enquiries"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Enquiry failed: ${res.status}`);
      return res.json() as Promise<{ id: string; reference?: string; success?: boolean }>;
    }
    console.log("MOCK submitEnquiry:", payload);
    return { success: true, id: "mock-id-001" };
  },

  // POST /api/v1/public/leads
  submitLead: async (email: string, persona: string) => {
    if (!USE_MOCKS && API_BASE_URL) {
      const res = await fetch(apiUrl("/api/v1/public/leads"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, persona }),
      });
      if (!res.ok) throw new Error(`Lead capture failed: ${res.status}`);
      return { success: true };
    }
    console.log("MOCK submitLead:", email, persona);
    return { success: true };
  },

  // POST /api/v1/public/products/{id}/click
  trackClick: async (productId: string) => {
    if (!USE_MOCKS && API_BASE_URL) {
      await fetch(apiUrl(`/api/v1/public/products/${encodeURIComponent(productId)}/click`), {
        method: "POST",
      });
      return;
    }
    console.log("MOCK trackClick:", productId);
  },
};
