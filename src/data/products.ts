// =====================================================================
// Product catalogue & company data — Moments Packaging Kenya Ltd.
// Two divisions: food-service and retail-industrial. Every product is
// tagged with `division` to power filtering on /products and the
// future admin dashboard.
// =====================================================================

export const WHATSAPP_NUMBER = "254700000000"; // ⚠️ replace with the client's live WhatsApp number
export const COMPANY_EMAIL = "sales@momentspackaging.co.ke";
export const COMPANY_PHONE = "+254 700 000 000";
export const COMPANY_ADDRESS = "Industrial Area, Nairobi · Kenya";

export type Division = "food" | "retail-industrial";
export type ProductTag = "Trending" | "New" | "Discounted" | "Featured";

export type Product = {
  id: string;
  slug: string;
  name: string;
  division: Division;
  category: string;
  description: string;
  moq: number;
  sizes: string[];
  tags: ProductTag[];
  /** Two-letter or two-character code printed on typographic product card */
  code: string;
};

export type Category = {
  slug: string;
  name: string;
  division: Division;
  blurb: string;
};

// ─── Divisions ────────────────────────────────────────────────────────
export const divisions: Record<Division, { label: string; tagline: string; description: string }> = {
  food: {
    label: "Food Service Packaging",
    tagline: "For restaurants, caterers & food brands",
    description:
      "Cups, food boxes, trays, bagasse containers, foil rolls, cling films, straws, hygienic supplies — everything a kitchen, café, QSR or cloud kitchen needs to serve and deliver.",
  },
  "retail-industrial": {
    label: "Retail & Industrial Packaging",
    tagline: "For shops, brands, agri & corporate gifting",
    description:
      "Branded shopping bags, kraft carriers, non-woven bags, mailers, labels, gifting boxes, grocery nets, baler twines and bulk supplies — built for retailers, e-commerce, agriculture and corporate procurement.",
  },
};

// ─── Categories ───────────────────────────────────────────────────────
export const categories: Category[] = [
  // FOOD
  { slug: "cups", name: "Cups & Lids", division: "food", blurb: "Single & double-wall hot cups, cold cups, lids, sleeves." },
  { slug: "food-boxes", name: "Food Boxes & Clamshells", division: "food", blurb: "Burger, pizza, deli, hexagonal & meal boxes." },
  { slug: "trays-containers", name: "Trays & Containers", division: "food", blurb: "Aluminium trays, plastic punnets, sugar bagasse trays." },
  { slug: "wraps-films", name: "Wraps, Foils & Films", division: "food", blurb: "Aluminium foil rolls, cling film, butter paper." },
  { slug: "straws-cutlery", name: "Straws, Cutlery & Sticks", division: "food", blurb: "Paper straws, milkshake straws, toothpicks, skewers." },
  { slug: "hygienic-supplies", name: "Hygienic Supplies", division: "food", blurb: "Gloves, hairnets, aprons — for kitchens & food handling." },

  // RETAIL & INDUSTRIAL
  { slug: "kraft-bags", name: "Kraft Carrier Bags", division: "retail-industrial", blurb: "Twisted-handle, flat-handle & SOS kraft bags." },
  { slug: "laminated-bags", name: "Laminated Smart Bags", division: "retail-industrial", blurb: "Full-colour photo-print laminated shopping bags." },
  { slug: "non-woven-bags", name: "Non-Woven Bags", division: "retail-industrial", blurb: "Reusable 3D, vest and D-cut non-woven shoppers." },
  { slug: "mailers", name: "Mailers & Shipping", division: "retail-industrial", blurb: "Tear-strip mailers and shipping cartons for e-commerce." },
  { slug: "labels", name: "Labels & Stickers", division: "retail-industrial", blurb: "Adhesive labels — matte, gloss, kraft or die-cut." },
  { slug: "gifting", name: "Gifting & Hampers", division: "retail-industrial", blurb: "Rigid boxes, tissue, hampers & corporate gift sets." },
  { slug: "agri-industrial", name: "Agri & Industrial", division: "retail-industrial", blurb: "Grocery nets, baler twines, bulk poly supplies." },
];

// ─── Products ─────────────────────────────────────────────────────────
export const products: Product[] = [
  // ── FOOD SERVICE ────────────────────────────────────────────────────
  {
    id: "p01", slug: "double-wall-coffee-cup", name: "Double-Wall Coffee Cup",
    division: "food", category: "cups", code: "DW",
    description: "Insulated 8oz / 12oz / 16oz hot drink cups. Branded with your logo, paired with sip-lids.",
    moq: 1000, sizes: ["8oz", "12oz", "16oz"], tags: ["Trending", "Featured"],
  },
  {
    id: "p02", slug: "single-wall-paper-cup", name: "Single-Wall Paper Cup",
    division: "food", category: "cups", code: "SW",
    description: "Standard food-grade single-wall hot cup. Cost-effective for high-volume cafés.",
    moq: 1000, sizes: ["6oz", "8oz", "12oz"], tags: ["Trending"],
  },
  {
    id: "p03", slug: "burger-clamshell-box", name: "Burger Clamshell Box",
    division: "food", category: "food-boxes", code: "BC",
    description: "Sturdy single-piece kraft clamshell. Perfect for burgers, wraps, sandwiches.",
    moq: 500, sizes: ['Standard 6"', 'Large 7"'], tags: ["Featured"],
  },
  {
    id: "p04", slug: "hexagonal-meal-box", name: "Hexagonal Meal Box",
    division: "food", category: "food-boxes", code: "HX",
    description: "Leak-resistant kraft hex box for hot meals, salads & bowls. Microwave safe.",
    moq: 500, sizes: ["650ml", "850ml", "1100ml"], tags: ["New"],
  },
  {
    id: "p05", slug: "pizza-corrugated-box", name: "Pizza Corrugated Box",
    division: "food", category: "food-boxes", code: "PZ",
    description: "Heat-retaining corrugated pizza box. Custom 1–4 colour print on lid.",
    moq: 500, sizes: ['9"', '10"', '12"', '14"'], tags: ["Trending"],
  },
  {
    id: "p06", slug: "deli-window-box", name: "Deli Window Box",
    division: "food", category: "food-boxes", code: "DL",
    description: "Kraft deli box with PET window. For pastries, cakes, salads, ready-meals.",
    moq: 500, sizes: ["Small", "Medium", "Large"], tags: ["New"],
  },
  {
    id: "p07", slug: "aluminium-meal-tray", name: "Aluminium Meal Tray",
    division: "food", category: "trays-containers", code: "AL",
    description: "Heat-safe aluminium foil trays with board lids. For hot meals & deliveries.",
    moq: 500, sizes: ["8oz", "16oz", "24oz", "32oz"], tags: ["Featured"],
  },
  {
    id: "p08", slug: "sugar-bagasse-container", name: "Sugar Bagasse Container",
    division: "food", category: "trays-containers", code: "SB",
    description: "Compostable sugarcane bagasse trays — 1, 3 and 5-compartment formats.",
    moq: 500, sizes: ["1-comp", "3-comp", "5-comp"], tags: ["New", "Trending"],
  },
  {
    id: "p09", slug: "aluminium-foil-roll", name: "Aluminium Foil Roll",
    division: "food", category: "wraps-films", code: "AF",
    description: "Food-grade aluminium foil roll. Branded outer carton — for kitchens & retail.",
    moq: 200, sizes: ["8m", "30m", "50m", "100m"], tags: ["Discounted"],
  },
  {
    id: "p10", slug: "cling-film-roll", name: "Cling Film Roll",
    division: "food", category: "wraps-films", code: "CF",
    description: "Catering and retail cling film. With or without slide-cutter dispenser.",
    moq: 200, sizes: ["100m", "300m", "600m"], tags: ["Featured"],
  },
  {
    id: "p11", slug: "milkshake-paper-straw", name: "Milkshake Paper Straw",
    division: "food", category: "straws-cutlery", code: "MS",
    description: "Wrapped & unwrapped jumbo paper straws — perfect for thick shakes & smoothies.",
    moq: 1000, sizes: ["6mm", "8mm", "12mm"], tags: ["Trending"],
  },
  {
    id: "p12", slug: "wrapped-toothpicks", name: "Wrapped Toothpicks",
    division: "food", category: "straws-cutlery", code: "TP",
    description: "Individually wrapped premium toothpicks. Branded outer box for restaurants.",
    moq: 1000, sizes: ["1000s", "5000s"], tags: ["Featured"],
  },
  {
    id: "p13", slug: "wooden-skewer-sticks", name: "Wooden Skewer Sticks",
    division: "food", category: "straws-cutlery", code: "SK",
    description: "Natural bamboo skewers — for grills, kebabs, fruit platters and catering.",
    moq: 1000, sizes: ["6\"", "8\"", "10\"", "12\""], tags: ["New"],
  },
  {
    id: "p14", slug: "hygienic-hand-gloves", name: "Hygienic Hand Gloves",
    division: "food", category: "hygienic-supplies", code: "GL",
    description: "Latex, nitrile and vinyl gloves. Boxed for kitchens, clinics and food handling.",
    moq: 100, sizes: ["S", "M", "L", "XL"], tags: ["Trending"],
  },
  {
    id: "p15", slug: "disposable-hairnet", name: "Disposable Hair Net",
    division: "food", category: "hygienic-supplies", code: "HN",
    description: "Bouffant-style disposable hairnets. Bulk-packed for food handling and clinics.",
    moq: 500, sizes: ['21"', '24"'], tags: ["Featured"],
  },

  // ── RETAIL & INDUSTRIAL ─────────────────────────────────────────────
  {
    id: "p20", slug: "kraft-twisted-handle-bag", name: "Kraft Twisted-Handle Bag",
    division: "retail-industrial", category: "kraft-bags", code: "TH",
    description: "Premium 120gsm kraft paper bag with twisted paper handles. Custom 1–4 colour print.",
    moq: 500, sizes: ["Small", "Medium", "Large"], tags: ["Trending", "Featured"],
  },
  {
    id: "p21", slug: "kraft-flat-handle-bag", name: "Kraft Flat-Handle Bag",
    division: "retail-industrial", category: "kraft-bags", code: "FH",
    description: "Flat-handle kraft carrier — strong, premium feel. For boutiques, cafés and retail.",
    moq: 500, sizes: ["Small", "Medium", "Large"], tags: ["Featured"],
  },
  {
    id: "p22", slug: "sos-grocery-bag", name: "SOS Grocery Bag",
    division: "retail-industrial", category: "kraft-bags", code: "SO",
    description: "Square-bottom self-opening kraft bag — for groceries, bakery and takeaway.",
    moq: 1000, sizes: ["#4", "#8", "#12", "#20"], tags: ["Trending"],
  },
  {
    id: "p23", slug: "laminated-smart-bag", name: "Classy Laminated Smart Bag",
    division: "retail-industrial", category: "laminated-bags", code: "LM",
    description: "Full-colour photo-laminated shopping bag with rope handle. Premium retail finish.",
    moq: 500, sizes: ["Small", "Medium", "Large", "XL"], tags: ["New", "Featured"],
  },
  {
    id: "p24", slug: "non-woven-3d-bag", name: "Eco Non-Woven 3D Bag",
    division: "retail-industrial", category: "non-woven-bags", code: "3D",
    description: "Reusable 3D-shape non-woven shopper. Branded — durable, cost-effective.",
    moq: 500, sizes: ["Small", "Medium", "Large"], tags: ["Trending"],
  },
  {
    id: "p25", slug: "non-woven-vest-bag", name: "Non-Woven Vest Bag",
    division: "retail-industrial", category: "non-woven-bags", code: "VB",
    description: "T-shirt style non-woven carrier — popular for promotions and supermarket runs.",
    moq: 1000, sizes: ["S", "M", "L"], tags: ["Featured"],
  },
  {
    id: "p26", slug: "non-woven-d-cut-bag", name: "Non-Woven D-Cut Bag",
    division: "retail-industrial", category: "non-woven-bags", code: "DC",
    description: "Punched D-handle non-woven bag. Lightweight, reusable, custom-printed.",
    moq: 1000, sizes: ["S", "M", "L"], tags: ["New"],
  },
  {
    id: "p27", slug: "ecommerce-kraft-mailer", name: "E-commerce Kraft Mailer",
    division: "retail-industrial", category: "mailers", code: "EM",
    description: "Tear-strip kraft mailer for online sellers. Branded inside & out.",
    moq: 250, sizes: ["A5", "A4", "A3"], tags: ["Discounted", "Trending"],
  },
  {
    id: "p28", slug: "branded-product-labels", name: "Branded Product Labels",
    division: "retail-industrial", category: "labels", code: "LB",
    description: "Adhesive labels in any shape — matte, gloss or kraft finish.",
    moq: 1000, sizes: ['Round 40mm', 'Round 60mm', 'Custom die-cut'], tags: ["New"],
  },
  {
    id: "p29", slug: "rigid-gift-box", name: "Rigid Gift Box",
    division: "retail-industrial", category: "gifting", code: "RG",
    description: "Magnetic-close rigid presentation box. Ideal for corporate gifting and end-of-year hampers.",
    moq: 100, sizes: ["Small", "Medium", "Large"], tags: ["Featured"],
  },
  {
    id: "p30", slug: "popcorn-chip-cup", name: "Popcorn & Chip Cup",
    division: "retail-industrial", category: "gifting", code: "PC",
    description: "Branded popcorn cups & chip cones for events, cinemas and pop-ups.",
    moq: 500, sizes: ["Small", "Medium", "Large"], tags: ["New"],
  },
  {
    id: "p31", slug: "grocery-net-bag", name: "Grocery Net Bag",
    division: "retail-industrial", category: "agri-industrial", code: "GN",
    description: "Mesh net bags for fruits, vegetables and grocery distribution. Bag-it-fresh formats.",
    moq: 500, sizes: ["1kg", "2kg", "5kg"], tags: ["Trending"],
  },
  {
    id: "p32", slug: "polythene-baler-twine", name: "Polythene Baler Twine",
    division: "retail-industrial", category: "agri-industrial", code: "BT",
    description: "Heavy-duty baler twine for agriculture and bulk industry. 100mm and 1000mm rolls.",
    moq: 50, sizes: ["100m", "1000m"], tags: ["Featured"],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────
export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function productOrderMessage(p: Product, size?: string, qty?: number) {
  return `Hi Moments Packaging, I'd like to order:\n\n• Product: ${p.name}\n• Size: ${size ?? p.sizes[0]}\n• Quantity: ${qty ?? p.moq}\n\nPlease send me a quote.`;
}

export function categoriesByDivision(div: Division) {
  return categories.filter((c) => c.division === div);
}

export function productsByDivision(div: Division) {
  return products.filter((p) => p.division === div);
}
