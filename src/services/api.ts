import { products, industries } from "@/data/products";
import { blogStore } from "@/services/blogStore";
import type { Blog, BlogStatus, BlogTemplate } from "@/data/blogs";

const API_URL = import.meta.env.VITE_API_URL ?? "";
void API_URL;

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

  // TODO: GET /api/products
  getProducts: async (params?: {
    industryId?: string;
    isDiscount?: boolean;
    isNewArrival?: boolean;
    isFastMoving?: boolean;
  }) => {
    let result = [...products];
    if (params?.industryId)
      result = result.filter((p) => p.industryIds.includes(params.industryId!));
    if (params?.isDiscount) result = result.filter((p) => p.isDiscount);
    if (params?.isNewArrival) result = result.filter((p) => p.isNewArrival);
    if (params?.isFastMoving) result = result.filter((p) => p.isFastMoving);
    return result;
  },

  // TODO: GET /api/products/search?q=
  searchProducts: async (q: string) => {
    const lower = q.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.description?.toLowerCase().includes(lower),
    );
  },

  // TODO: GET /api/products/recommended
  getRecommended: async () =>
    [...products].sort((a, b) => b.monthlyClicks - a.monthlyClicks).slice(0, 4),

  // TODO: GET /api/industries
  getIndustries: async () => industries,

  // TODO: POST /api/enquiries
  submitEnquiry: async (payload: unknown) => {
    console.log("MOCK submitEnquiry:", payload);
    return { success: true, id: "mock-id-001" };
  },

  // TODO: POST /api/leads
  submitLead: async (email: string, persona: string) => {
    console.log("MOCK submitLead:", email, persona);
    return { success: true };
  },

  // TODO: POST /api/products/{id}/click
  trackClick: async (productId: string) => {
    console.log("MOCK trackClick:", productId);
  },
};
