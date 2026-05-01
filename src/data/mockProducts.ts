import type { Product } from "@/data/products";

/**
 * Hardcoded fallback catalogue used by the products listing when the live API
 * is unreachable, returns 404, or otherwise can't deliver a catalogue.
 *
 * Covers 4 categories: bags, boxes, cups, mailers.
 * Each item carries: name, category, price per unit (KSh), MOQ, and a coloured
 * placeholder image (inline SVG data URL) so the grid renders without assets.
 */

type MockSeed = {
  id: string;
  slug: string;
  name: string;
  category: "bags" | "boxes" | "cups" | "mailers";
  basePrice: number;
  moq: number;
  /** Hex background for the placeholder tile. */
  bg: string;
  /** Short label drawn on the placeholder tile. */
  label: string;
};

const seeds: MockSeed[] = [
  { id: "mock-bag-1",     slug: "mock-kraft-twisted-handle-bag", name: "Kraft Twisted-Handle Paper Bag", category: "bags",    basePrice: 28,  moq: 100, bg: "#C9A37A", label: "Bag" },
  { id: "mock-bag-2",     slug: "mock-flat-handle-shopper",      name: "Flat-Handle Retail Shopper",     category: "bags",    basePrice: 35,  moq: 200, bg: "#A87E54", label: "Bag" },
  { id: "mock-box-1",     slug: "mock-burger-meal-box",          name: "Branded Burger Meal Box",        category: "boxes",   basePrice: 22,  moq: 250, bg: "#D9B382", label: "Box" },
  { id: "mock-box-2",     slug: "mock-rigid-gift-box",           name: "Rigid Gift Box (Magnetic Lid)",  category: "boxes",   basePrice: 180, moq: 100, bg: "#7B5E3C", label: "Box" },
  { id: "mock-cup-1",     slug: "mock-double-wall-hot-cup",      name: "Double-Wall Hot Cup 8oz",        category: "cups",    basePrice: 9,   moq: 500, bg: "#E8D2B0", label: "Cup" },
  { id: "mock-cup-2",     slug: "mock-cold-cup-pet",             name: "Clear Cold Cup 16oz",            category: "cups",    basePrice: 11,  moq: 500, bg: "#B6CFE0", label: "Cup" },
  { id: "mock-mailer-1",  slug: "mock-kraft-courier-mailer",     name: "Kraft Courier Mailer (Medium)",  category: "mailers", basePrice: 45,  moq: 200, bg: "#9C7C56", label: "Mailer" },
  { id: "mock-mailer-2",  slug: "mock-return-mailer-tear",       name: "Return Mailer with Tear-Strip",  category: "mailers", basePrice: 60,  moq: 200, bg: "#6E5236", label: "Mailer" },
];

function placeholderImage(bg: string, label: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">` +
      `<rect width="600" height="600" fill="${bg}"/>` +
      `<text x="50%" y="50%" dy=".35em" text-anchor="middle" ` +
        `font-family="Georgia, serif" font-size="56" fill="rgba(255,255,255,0.92)">` +
        `${label}` +
      `</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const MOCK_PRODUCTS: Product[] = seeds.map((s) => {
  const image = placeholderImage(s.bg, s.label);
  return {
    id: s.id,
    slug: s.slug,
    name: s.name,
    category: s.category,
    description: `${s.name} — sample item. Connect the live catalogue to see real specs.`,
    moq: s.moq,
    sizes: [],
    tags: [],
    image,
    images: [image],
    isDiscount: false,
    isNewArrival: false,
    isFastMoving: false,
    industryIds: [],
    totalClicks: 0,
    monthlyClicks: 0,
    totalEnquiries: 0,
    monthlyEnquiries: 0,
    basePrice: s.basePrice,
  };
});
