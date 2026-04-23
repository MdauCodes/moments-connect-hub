import { products, industries } from "@/data/products";

const API_URL = import.meta.env.VITE_API_URL ?? "";
void API_URL;

export const api = {
  // TODO: GET /api/config
  getConfig: async () => ({
    blogsEnabled: false,
    emailCaptureEnabled: true,
  }),

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
