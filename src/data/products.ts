import bagsImg from "@/assets/cat-bags.jpg";
import cupsImg from "@/assets/cat-cups.jpg";
import boxesImg from "@/assets/cat-boxes.jpg";
import labelsImg from "@/assets/cat-labels.jpg";
import giftingImg from "@/assets/cat-gifting.jpg";
import mailersImg from "@/assets/cat-mailers.jpg";
import {
  UtensilsCrossed,
  Wheat,
  Shirt,
  Package,
  Gift,
  Sparkles,
  Pill,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export const WHATSAPP_NUMBER = "254700000000"; // placeholder — replace with client number
export const COMPANY_EMAIL = "sales@momentspackaging.co.ke";
export const COMPANY_PHONE = "+254 700 000 000";

export type ProductTag = "Trending" | "New" | "Discounted" | "Featured";

export interface Industry {
  id: string;
  name: string;
  slug: string;
  /** Lucide icon component rendered in chips/lists. */
  icon: LucideIcon;
  description: string;
  /** Short tagline used on the home strip + /industries hero card. */
  tagline?: string;
  /** Synonyms / colloquialisms to broaden search recall. */
  keywords?: string[];
}

/**
 * Canonical taxonomy of markets we serve.
 * Keep IDs stable — they're referenced by `Product.industryIds`.
 *
 * Backend mapping: `industries` table (id/name/slug/description) +
 * `industry_keywords` text[] for search recall. See backendSpec.md §3.3.
 */
export const industries: Industry[] = [
  {
    id: "1",
    name: "Food & Beverage",
    slug: "food-beverage",
    icon: UtensilsCrossed,
    description: "Restaurants, cafés, cloud kitchens & takeaways.",
    tagline: "From the first sip to the last bite.",
    keywords: ["restaurant", "cafe", "coffee", "takeaway", "delivery", "fnb", "kitchen", "bakery", "juice", "drinks"],
  },
  {
    id: "2",
    name: "Agriculture",
    slug: "agriculture",
    icon: Wheat,
    description: "Farm produce, seeds, agro-processed goods & exports.",
    tagline: "Field to shelf — packed to last.",
    keywords: ["farm", "agro", "produce", "seeds", "grain", "tea", "coffee beans", "horticulture", "export"],
  },
  {
    id: "3",
    name: "Textile & Apparel",
    slug: "textile-apparel",
    icon: Shirt,
    description: "Fashion brands, tailors, fabric & garment exporters.",
    tagline: "Packaging your customers want to keep.",
    keywords: ["fashion", "clothing", "garments", "boutique", "tailor", "fabric", "apparel"],
  },
  {
    id: "4",
    name: "E-commerce & Mailers",
    slug: "ecommerce-mailers",
    icon: Package,
    description: "Online sellers, D2C brands & courier-ready packs.",
    tagline: "Built for the unboxing reel.",
    keywords: ["online store", "d2c", "shipping", "courier", "instagram shop", "tiktok shop", "mailer"],
  },
  {
    id: "5",
    name: "Gifting & Events",
    slug: "gifting-events",
    icon: Gift,
    description: "Weddings, birthdays, corporate hampers & event swag.",
    tagline: "Make the moment memorable.",
    keywords: ["wedding", "birthday", "hamper", "gift", "events", "corporate gifting", "swag", "favours"],
  },
  {
    id: "6",
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    icon: Sparkles,
    description: "Skincare, haircare, candles, soap & wellness brands.",
    tagline: "Shelf-ready packaging that sells itself.",
    keywords: ["skincare", "cosmetics", "haircare", "candles", "soap", "spa", "wellness", "beauty"],
  },
  {
    id: "7",
    name: "Pharma & Health",
    slug: "pharma-health",
    icon: Pill,
    description: "Pharmacies, supplements, clinics & medical supplies.",
    tagline: "Compliant. Tamper-evident. On time.",
    keywords: ["pharmacy", "medicine", "supplements", "clinic", "medical", "health", "drugs"],
  },
  {
    id: "8",
    name: "Industrial & Hardware",
    slug: "industrial-hardware",
    icon: Wrench,
    description: "Manufacturers, hardware brands & B2B suppliers.",
    tagline: "Heavy-duty packs that survive the warehouse.",
    keywords: ["industrial", "hardware", "manufacturing", "tools", "spares", "b2b", "wholesale"],
  },
];

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  moq: number;
  sizes: string[];
  tags: ProductTag[];
  image: string;
  images: string[];
  isDiscount: boolean;
  discountPercent?: number;
  isNewArrival: boolean;
  isFastMoving: boolean;
  industryIds: string[];
  totalClicks: number;
  monthlyClicks: number;
  totalEnquiries: number;
  monthlyEnquiries: number;
  /**
   * Optional searchable enrichments (admin-editable, all backend-bound).
   * Kept optional so existing fixtures keep working.
   */
  material?: string; // e.g. "Kraft 120gsm", "PE-lined paper"
  finish?: string;   // e.g. "Matte", "Gloss", "Soft-touch"
  keywords?: string[]; // free-form synonyms / sheng / common misspellings
};

export const categories = [
  { slug: "bags", name: "Paper Bags", image: bagsImg, blurb: "Twisted-handle, flat-handle & SOS kraft bags." },
  { slug: "cups", name: "Cups & Lids", image: cupsImg, blurb: "Single & double-wall hot cups, cold cups, lids." },
  { slug: "boxes", name: "Food Boxes", image: boxesImg, blurb: "Burger, salad, noodle, hexagonal & meal boxes." },
  { slug: "mailers", name: "Mailers & Shipping", image: mailersImg, blurb: "E-commerce kraft mailers and shipping cartons." },
  { slug: "labels", name: "Labels & Stickers", image: labelsImg, blurb: "Branded product labels & seals." },
  { slug: "gifting", name: "Gifting & Retail", image: giftingImg, blurb: "Rigid boxes, tissue, ribbons & gift sets." },
];

export const products: Product[] = [
  {
    id: "p1", slug: "kraft-twisted-handle-bag",
    name: "Kraft Twisted-Handle Bag",
    category: "bags", image: bagsImg,
    description: "Premium 120gsm kraft paper bag with twisted paper handles. Custom 1–4 colour print.",
    moq: 500, sizes: ['Small (200×100×250mm)', 'Medium (260×140×320mm)', 'Large (320×160×380mm)'],
    tags: ["Trending", "Featured"],
    images: [bagsImg],
    isDiscount: false,
    isNewArrival: true,
    isFastMoving: true,
    industryIds: ["1", "3", "4", "6"],
    material: "Kraft 120gsm",
    finish: "Matte",
    keywords: ["paper bag", "carrier bag", "shopping bag", "gift bag"],
    totalClicks: 1240, monthlyClicks: 312,
    totalEnquiries: 86, monthlyEnquiries: 19,
  },
  {
    id: "p2", slug: "double-wall-coffee-cup",
    name: "Double-Wall Coffee Cup",
    category: "cups", image: cupsImg,
    description: "Insulated 8oz / 12oz / 16oz hot drink cups. Branded with your logo.",
    moq: 1000, sizes: ["8oz", "12oz", "16oz"],
    tags: ["Trending"],
    images: [cupsImg],
    isDiscount: true,
    discountPercent: 15,
    isNewArrival: true,
    isFastMoving: false,
    industryIds: ["1"],
    material: "PE-lined paper",
    finish: "Matte",
    keywords: ["coffee", "tea", "hot cup", "takeaway cup", "kikombe"],
    totalClicks: 980, monthlyClicks: 244,
    totalEnquiries: 71, monthlyEnquiries: 16,
  },
  {
    id: "p3", slug: "hexagonal-meal-box",
    name: "Hexagonal Meal Box",
    category: "boxes", image: boxesImg,
    description: "Leak-resistant kraft hex box for hot meals, salads & bowls. Microwave safe.",
    moq: 500, sizes: ["650ml", "850ml", "1100ml"],
    tags: ["New"],
    images: [boxesImg],
    isDiscount: false,
    isNewArrival: false,
    isFastMoving: false,
    industryIds: ["1", "4"],
    material: "Kraft + PE liner",
    finish: "Natural",
    keywords: ["meal box", "lunch box", "salad bowl", "delivery box"],
    totalClicks: 612, monthlyClicks: 138,
    totalEnquiries: 42, monthlyEnquiries: 9,
  },
  {
    id: "p4", slug: "burger-clamshell-box",
    name: "Burger Clamshell Box",
    category: "boxes", image: boxesImg,
    description: "Sturdy single-piece clamshell. Perfect for burgers, wraps, sandwiches.",
    moq: 500, sizes: ['Standard 6"', 'Large 7"'],
    tags: ["Featured"],
    images: [boxesImg],
    isDiscount: false,
    isNewArrival: false,
    isFastMoving: true,
    industryIds: ["1", "4"],
    material: "Kraft 350gsm",
    finish: "Natural",
    keywords: ["burger box", "clamshell", "sandwich box", "wrap box"],
    totalClicks: 845, monthlyClicks: 201,
    totalEnquiries: 58, monthlyEnquiries: 14,
  },
  {
    id: "p5", slug: "ecommerce-kraft-mailer",
    name: "E-commerce Kraft Mailer",
    category: "mailers", image: mailersImg,
    description: "Tear-strip kraft mailer for online sellers. Branded inside & out.",
    moq: 250, sizes: ["A5", "A4", "A3"],
    tags: ["Discounted"],
    images: [mailersImg],
    isDiscount: true,
    discountPercent: 15,
    isNewArrival: false,
    isFastMoving: false,
    industryIds: ["4", "3", "6"],
    material: "Kraft 250gsm",
    finish: "Natural",
    keywords: ["mailer", "shipping bag", "courier pack", "ecommerce envelope", "polymailer alternative"],
    totalClicks: 734, monthlyClicks: 178,
    totalEnquiries: 49, monthlyEnquiries: 12,
  },
  {
    id: "p6", slug: "branded-product-labels",
    name: "Branded Product Labels",
    category: "labels", image: labelsImg,
    description: "Adhesive labels in any shape — matte, gloss or kraft finish.",
    moq: 1000, sizes: ['Round 40mm', 'Round 60mm', 'Custom die-cut'],
    tags: ["New"],
    images: [labelsImg],
    isDiscount: false,
    isNewArrival: false,
    isFastMoving: false,
    industryIds: ["2", "6", "7", "8"],
    material: "Self-adhesive vinyl / paper",
    finish: "Matte / Gloss / Kraft",
    keywords: ["sticker", "label", "seal", "tag", "barcode label"],
    totalClicks: 423, monthlyClicks: 96,
    totalEnquiries: 28, monthlyEnquiries: 6,
  },
  {
    id: "p7", slug: "rigid-gift-box",
    name: "Rigid Gift Box",
    category: "gifting", image: giftingImg,
    description: "Magnetic-close rigid presentation box. Ideal for corporate gifting.",
    moq: 100, sizes: ["Small", "Medium", "Large"],
    tags: ["Featured"],
    images: [giftingImg],
    isDiscount: false,
    isNewArrival: false,
    isFastMoving: true,
    industryIds: ["5", "6"],
    material: "Greyboard 1200gsm + art paper wrap",
    finish: "Soft-touch",
    keywords: ["gift box", "hamper box", "wedding box", "corporate gift", "presentation box"],
    totalClicks: 567, monthlyClicks: 134,
    totalEnquiries: 39, monthlyEnquiries: 11,
  },
  {
    id: "p8", slug: "sos-grocery-bag",
    name: "SOS Grocery Bag",
    category: "bags", image: bagsImg,
    description: "Square-bottom self-opening kraft bag for groceries and takeaway.",
    moq: 1000, sizes: ["#4", "#8", "#12", "#20"],
    tags: ["Trending"],
    images: [bagsImg],
    isDiscount: false,
    isNewArrival: false,
    isFastMoving: false,
    industryIds: ["2", "1", "8"],
    material: "Kraft 90gsm",
    finish: "Natural",
    keywords: ["grocery bag", "sos bag", "flat bottom bag", "produce bag", "mboga bag"],
    totalClicks: 689, monthlyClicks: 162,
    totalEnquiries: 47, monthlyEnquiries: 10,
  },
];

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function productOrderMessage(p: Product, size?: string, qty?: number) {
  return `Hi Moments Packaging, I'd like to order:\n\n• Product: ${p.name}\n• Size: ${size ?? p.sizes[0]}\n• Quantity: ${qty ?? p.moq}\n\nPlease send me a quote.`;
}
