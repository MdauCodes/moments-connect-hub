import bagsImg from "@/assets/cat-bags.jpg";
import cupsImg from "@/assets/cat-cups.jpg";
import boxesImg from "@/assets/cat-boxes.jpg";
import labelsImg from "@/assets/cat-labels.jpg";
import giftingImg from "@/assets/cat-gifting.jpg";
import mailersImg from "@/assets/cat-mailers.jpg";
import foodTakeawaySetImg from "@/assets/prod-food-takeaway-set.jpg";
import foodCakeWindowBoxImg from "@/assets/prod-food-cake-window-box.jpg";
import agriSeedPouchImg from "@/assets/prod-agri-seed-pouch.jpg";
import agriProduceCrateSleeveImg from "@/assets/prod-agri-produce-crate-sleeve.jpg";
import textileGarmentMailerImg from "@/assets/prod-textile-garment-mailer.jpg";
import textileFabricSleeveImg from "@/assets/prod-textile-fabric-sleeve.jpg";
import ecommerceCourierBoxImg from "@/assets/prod-ecommerce-courier-box.jpg";
import ecommerceReturnMailerImg from "@/assets/prod-ecommerce-return-mailer.jpg";
import giftingHamperTrayImg from "@/assets/prod-gifting-hamper-tray.jpg";
import giftingFavourBoxImg from "@/assets/prod-gifting-favour-box.jpg";
import beautySkincareCartonImg from "@/assets/prod-beauty-skincare-carton.jpg";
import beautySoapWrapImg from "@/assets/prod-beauty-soap-wrap.jpg";
import pharmaTamperLabelsImg from "@/assets/prod-pharma-tamper-labels.jpg";
import pharmaSupplementCartonImg from "@/assets/prod-pharma-supplement-carton.jpg";
import industrialPartsCartonImg from "@/assets/prod-industrial-parts-carton.jpg";
import industrialHardwareSachetImg from "@/assets/prod-industrial-hardware-sachet.jpg";
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

export const WHATSAPP_NUMBER = "254119556688";
export const COMPANY_EMAIL = "sales@momentspackaging.co.ke";
export const COMPANY_PHONE = "0119 556 688";

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
  /** Backend-only enrichments (Phase C). UI must handle absence gracefully. */
  basePrice?: number;
  materials?: string[];
  primaryImageUrl?: string;
  imageUrls?: string[];
  industries?: Array<{ id: string; name: string; slug: string }>;
  pricingTiers?: Array<{ minQty: number; maxQty?: number; pricePerUnit: number }>;
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
    id: "p-food-1",
    slug: "restaurant-takeaway-meal-set",
    name: "Restaurant Takeaway Meal Set",
    category: "boxes",
    description: "Coordinated kraft meal box, cup carrier and napkin band for restaurants, cafés and cloud kitchens handling delivery orders.",
    moq: 500,
    sizes: ["Small combo", "Regular combo", "Family combo"],
    tags: ["Trending", "Featured"],
    image: foodTakeawaySetImg,
    images: [foodTakeawaySetImg],
    isDiscount: false,
    isNewArrival: true,
    isFastMoving: true,
    industryIds: ["1"],
    material: "Food-grade kraft board + PE liner",
    finish: "Natural matte",
    keywords: ["takeaway", "restaurant packaging", "delivery meal box", "cloud kitchen", "food combo"],
    totalClicks: 1240,
    monthlyClicks: 312,
    totalEnquiries: 86,
    monthlyEnquiries: 19,
  },
  {
    id: "p-food-2",
    slug: "bakery-window-cake-box",
    name: "Bakery Window Cake Box",
    category: "boxes",
    description: "Windowed pastry and cake cartons that keep baked goods visible, protected and ready for café counters or delivery riders.",
    moq: 500,
    sizes: ["Cupcake 2-pack", "Slice box", "Half-kilo cake"],
    tags: ["New"],
    image: foodCakeWindowBoxImg,
    images: [foodCakeWindowBoxImg],
    isDiscount: false,
    isNewArrival: true,
    isFastMoving: false,
    industryIds: ["1"],
    material: "SBS board + PET window",
    finish: "Matte with clear window",
    keywords: ["bakery", "cake box", "pastry box", "cookie box", "window carton"],
    totalClicks: 980,
    monthlyClicks: 244,
    totalEnquiries: 71,
    monthlyEnquiries: 16,
  },
  {
    id: "p-agri-1",
    slug: "resealable-seed-pouch",
    name: "Resealable Seed Pouch",
    category: "labels",
    description: "Stand-up zipper pouch for seeds, grains and agro inputs with printable panels for batch details and planting instructions.",
    moq: 1000,
    sizes: ["100g", "250g", "500g", "1kg"],
    tags: ["Featured"],
    image: agriSeedPouchImg,
    images: [agriSeedPouchImg],
    isDiscount: false,
    isNewArrival: false,
    isFastMoving: true,
    industryIds: ["2"],
    material: "Kraft laminate + food-safe inner liner",
    finish: "Natural matte",
    keywords: ["seed pouch", "grain pouch", "agro packaging", "farm inputs", "zip pouch"],
    totalClicks: 734,
    monthlyClicks: 178,
    totalEnquiries: 49,
    monthlyEnquiries: 12,
  },
  {
    id: "p-agri-2",
    slug: "fresh-produce-crate-sleeve",
    name: "Fresh Produce Crate Sleeve",
    category: "boxes",
    description: "Corrugated crate sleeves and inserts for vegetables, fruits and export produce moving from farm gate to retail shelf.",
    moq: 500,
    sizes: ["5kg crate", "10kg crate", "Export carton"],
    tags: ["Trending"],
    image: agriProduceCrateSleeveImg,
    images: [agriProduceCrateSleeveImg],
    isDiscount: false,
    isNewArrival: false,
    isFastMoving: false,
    industryIds: ["2"],
    material: "E-flute corrugated board",
    finish: "Water-based print",
    keywords: ["produce box", "farm crate", "horticulture", "vegetable packaging", "export carton"],
    totalClicks: 689,
    monthlyClicks: 162,
    totalEnquiries: 47,
    monthlyEnquiries: 10,
  },
  {
    id: "p-textile-1",
    slug: "boutique-garment-mailer",
    name: "Boutique Garment Mailer",
    category: "mailers",
    description: "Recyclable garment mailer for fashion brands shipping shirts, dresses and accessories with a polished unboxing feel.",
    moq: 250,
    sizes: ["A5", "A4", "A3"],
    tags: ["Trending"],
    image: textileGarmentMailerImg,
    images: [textileGarmentMailerImg],
    isDiscount: true,
    discountPercent: 10,
    isNewArrival: false,
    isFastMoving: true,
    industryIds: ["3"],
    material: "Kraft 250gsm",
    finish: "Natural matte",
    keywords: ["fashion mailer", "garment bag", "clothing packaging", "boutique shipping", "apparel"],
    totalClicks: 845,
    monthlyClicks: 201,
    totalEnquiries: 58,
    monthlyEnquiries: 14,
  },
  {
    id: "p-textile-2",
    slug: "fabric-belly-band-sleeve",
    name: "Fabric Belly Band Sleeve",
    category: "labels",
    description: "Printed paper bands and sleeves for folded fabric, uniforms and apparel sets sold in boutiques or exported in bulk.",
    moq: 1000,
    sizes: ["40mm band", "60mm band", "Custom sleeve"],
    tags: ["New"],
    image: textileFabricSleeveImg,
    images: [textileFabricSleeveImg],
    isDiscount: false,
    isNewArrival: true,
    isFastMoving: false,
    industryIds: ["3"],
    material: "Kraft paper / art paper",
    finish: "Matte or soft-touch",
    keywords: ["fabric sleeve", "belly band", "clothing label", "uniform packaging", "textile wrap"],
    totalClicks: 612,
    monthlyClicks: 138,
    totalEnquiries: 42,
    monthlyEnquiries: 9,
  },
  {
    id: "p-ecom-1",
    slug: "courier-ready-shipping-box",
    name: "Courier-Ready Shipping Box",
    category: "mailers",
    description: "Sturdy corrugated shipping box with tear-strip opening and clean label zones for online sellers and D2C brands.",
    moq: 250,
    sizes: ["Small parcel", "Medium parcel", "Large parcel"],
    tags: ["Featured"],
    image: ecommerceCourierBoxImg,
    images: [ecommerceCourierBoxImg],
    isDiscount: false,
    isNewArrival: false,
    isFastMoving: true,
    industryIds: ["4"],
    material: "B-flute corrugated kraft",
    finish: "Natural / single-colour print",
    keywords: ["shipping box", "courier box", "ecommerce packaging", "parcel box", "online shop"],
    totalClicks: 1180,
    monthlyClicks: 286,
    totalEnquiries: 77,
    monthlyEnquiries: 18,
  },
  {
    id: "p-ecom-2",
    slug: "double-strip-return-mailer",
    name: "Double-Strip Return Mailer",
    category: "mailers",
    description: "Kraft mailer with dual adhesive strips so customers can reseal returns without extra tape or packaging waste.",
    moq: 500,
    sizes: ["A5", "A4", "A3", "XL"],
    tags: ["Discounted"],
    image: ecommerceReturnMailerImg,
    images: [ecommerceReturnMailerImg],
    isDiscount: true,
    discountPercent: 15,
    isNewArrival: false,
    isFastMoving: false,
    industryIds: ["4"],
    material: "Kraft 200gsm",
    finish: "Natural matte",
    keywords: ["return mailer", "reusable mailer", "courier envelope", "instagram shop", "d2c"],
    totalClicks: 734,
    monthlyClicks: 178,
    totalEnquiries: 49,
    monthlyEnquiries: 12,
  },
  {
    id: "p-gift-1",
    slug: "corporate-hamper-tray",
    name: "Corporate Hamper Tray",
    category: "gifting",
    description: "Rigid hamper tray with dividers and sleeve options for corporate gifting, festive packs and premium event giveaways.",
    moq: 100,
    sizes: ["Small", "Medium", "Executive"],
    tags: ["Featured"],
    image: giftingHamperTrayImg,
    images: [giftingHamperTrayImg],
    isDiscount: false,
    isNewArrival: false,
    isFastMoving: true,
    industryIds: ["5"],
    material: "Greyboard 1200gsm + art paper wrap",
    finish: "Soft-touch",
    keywords: ["hamper box", "corporate gift", "gift tray", "event swag", "premium gifting"],
    totalClicks: 567,
    monthlyClicks: 134,
    totalEnquiries: 39,
    monthlyEnquiries: 11,
  },
  {
    id: "p-gift-2",
    slug: "event-favour-box",
    name: "Event Favour Box",
    category: "gifting",
    description: "Small ribbon-ready favour boxes for weddings, birthdays, launches and branded table gifts.",
    moq: 300,
    sizes: ["Mini cube", "Tall favour", "Custom die-cut"],
    tags: ["New"],
    image: giftingFavourBoxImg,
    images: [giftingFavourBoxImg],
    isDiscount: false,
    isNewArrival: true,
    isFastMoving: false,
    industryIds: ["5"],
    material: "Ivory board / kraft board",
    finish: "Matte with ribbon closure",
    keywords: ["wedding favour", "event box", "birthday gift", "table gift", "swag box"],
    totalClicks: 423,
    monthlyClicks: 96,
    totalEnquiries: 28,
    monthlyEnquiries: 6,
  },
  {
    id: "p-beauty-1",
    slug: "skincare-carton-and-label-set",
    name: "Skincare Carton & Label Set",
    category: "labels",
    description: "Premium cartons and matching labels for serums, creams and haircare products that need a clean retail shelf presence.",
    moq: 1000,
    sizes: ["30ml serum", "50ml jar", "100ml bottle"],
    tags: ["Featured", "New"],
    image: beautySkincareCartonImg,
    images: [beautySkincareCartonImg],
    isDiscount: false,
    isNewArrival: true,
    isFastMoving: true,
    industryIds: ["6"],
    material: "SBS board + adhesive label stock",
    finish: "Matte / foil-ready",
    keywords: ["skincare packaging", "cosmetic carton", "serum label", "haircare", "beauty brand"],
    totalClicks: 980,
    monthlyClicks: 244,
    totalEnquiries: 71,
    monthlyEnquiries: 16,
  },
  {
    id: "p-beauty-2",
    slug: "soap-candle-wrap-kit",
    name: "Soap & Candle Wrap Kit",
    category: "labels",
    description: "Paper wraps, seals and small boxes for handmade soap, candles and wellness products sold online or in boutiques.",
    moq: 1000,
    sizes: ["Soap wrap", "Candle label", "Mini carton"],
    tags: ["Trending"],
    image: beautySoapWrapImg,
    images: [beautySoapWrapImg],
    isDiscount: false,
    isNewArrival: false,
    isFastMoving: false,
    industryIds: ["6"],
    material: "Kraft paper + adhesive paper labels",
    finish: "Natural / gloss label option",
    keywords: ["soap wrap", "candle label", "wellness packaging", "spa", "natural beauty"],
    totalClicks: 689,
    monthlyClicks: 162,
    totalEnquiries: 47,
    monthlyEnquiries: 10,
  },
  {
    id: "p-pharma-1",
    slug: "tamper-evident-pharmacy-labels",
    name: "Tamper-Evident Pharmacy Labels",
    category: "labels",
    description: "Security seals, bottle labels and barcode stickers for pharmacies, clinics and health product distributors.",
    moq: 1000,
    sizes: ["20mm seal", "40mm bottle label", "Custom die-cut"],
    tags: ["Featured"],
    image: pharmaTamperLabelsImg,
    images: [pharmaTamperLabelsImg],
    isDiscount: false,
    isNewArrival: false,
    isFastMoving: true,
    industryIds: ["7"],
    material: "Tamper-evident vinyl / paper label stock",
    finish: "Matte / barcode-ready",
    keywords: ["pharmacy label", "security seal", "medicine label", "barcode sticker", "clinic"],
    totalClicks: 612,
    monthlyClicks: 138,
    totalEnquiries: 42,
    monthlyEnquiries: 9,
  },
  {
    id: "p-pharma-2",
    slug: "supplement-folding-carton",
    name: "Supplement Folding Carton",
    category: "boxes",
    description: "Clean folding cartons and blister-card sleeves for vitamins, supplements and clinic retail products.",
    moq: 500,
    sizes: ["30-count", "60-count", "Blister sleeve"],
    tags: ["New"],
    image: pharmaSupplementCartonImg,
    images: [pharmaSupplementCartonImg],
    isDiscount: false,
    isNewArrival: true,
    isFastMoving: false,
    industryIds: ["7"],
    material: "SBS board 350gsm",
    finish: "Clinical matte",
    keywords: ["supplement box", "vitamin carton", "blister sleeve", "health packaging", "medical supplies"],
    totalClicks: 423,
    monthlyClicks: 96,
    totalEnquiries: 28,
    monthlyEnquiries: 6,
  },
  {
    id: "p-industrial-1",
    slug: "reinforced-parts-carton",
    name: "Reinforced Parts Carton",
    category: "boxes",
    description: "Heavy-duty corrugated cartons for spare parts, tools and warehouse stock that needs strong stacking protection.",
    moq: 250,
    sizes: ["Small parts", "Medium parts", "Bulk carton"],
    tags: ["Trending"],
    image: industrialPartsCartonImg,
    images: [industrialPartsCartonImg],
    isDiscount: false,
    isNewArrival: false,
    isFastMoving: true,
    industryIds: ["8"],
    material: "Double-wall corrugated board",
    finish: "Natural / barcode label area",
    keywords: ["parts carton", "hardware packaging", "warehouse box", "spare parts", "industrial carton"],
    totalClicks: 845,
    monthlyClicks: 201,
    totalEnquiries: 58,
    monthlyEnquiries: 14,
  },
  {
    id: "p-industrial-2",
    slug: "hardware-sachet-header-card",
    name: "Hardware Sachet Header Card",
    category: "labels",
    description: "Header cards, sachets and labels for screws, fasteners, fittings and small hardware sold on pegboards or counters.",
    moq: 1000,
    sizes: ["Mini sachet", "Pegboard card", "Counter pack"],
    tags: ["Discounted"],
    image: industrialHardwareSachetImg,
    images: [industrialHardwareSachetImg],
    isDiscount: true,
    discountPercent: 12,
    isNewArrival: false,
    isFastMoving: false,
    industryIds: ["8"],
    material: "Kraft card + clear sachet film",
    finish: "Matte print",
    keywords: ["fastener pack", "screws packaging", "header card", "hardware label", "tools"],
    totalClicks: 567,
    monthlyClicks: 134,
    totalEnquiries: 39,
    monthlyEnquiries: 11,
  },
];

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function productOrderMessage(p: Product, size?: string, qty?: number) {
  return `Hi Moments Packaging, I'd like to order:\n\n• Product: ${p.name}\n• Size: ${size ?? p.sizes[0]}\n• Quantity: ${qty ?? p.moq}\n\nPlease send me a quote.`;
}
