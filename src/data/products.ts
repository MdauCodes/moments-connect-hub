import bagsImg from "@/assets/cat-bags.jpg";
import cupsImg from "@/assets/cat-cups.jpg";
import boxesImg from "@/assets/cat-boxes.jpg";
import labelsImg from "@/assets/cat-labels.jpg";
import giftingImg from "@/assets/cat-gifting.jpg";
import mailersImg from "@/assets/cat-mailers.jpg";

export const WHATSAPP_NUMBER = "254700000000"; // placeholder — replace with client number
export const COMPANY_EMAIL = "sales@momentspackaging.co.ke";
export const COMPANY_PHONE = "+254 700 000 000";

export type ProductTag = "Trending" | "New" | "Discounted" | "Featured";

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
  },
  {
    id: "p2", slug: "double-wall-coffee-cup",
    name: "Double-Wall Coffee Cup",
    category: "cups", image: cupsImg,
    description: "Insulated 8oz / 12oz / 16oz hot drink cups. Branded with your logo.",
    moq: 1000, sizes: ["8oz", "12oz", "16oz"],
    tags: ["Trending"],
  },
  {
    id: "p3", slug: "hexagonal-meal-box",
    name: "Hexagonal Meal Box",
    category: "boxes", image: boxesImg,
    description: "Leak-resistant kraft hex box for hot meals, salads & bowls. Microwave safe.",
    moq: 500, sizes: ["650ml", "850ml", "1100ml"],
    tags: ["New"],
  },
  {
    id: "p4", slug: "burger-clamshell-box",
    name: "Burger Clamshell Box",
    category: "boxes", image: boxesImg,
    description: "Sturdy single-piece clamshell. Perfect for burgers, wraps, sandwiches.",
    moq: 500, sizes: ['Standard 6"', 'Large 7"'],
    tags: ["Featured"],
  },
  {
    id: "p5", slug: "ecommerce-kraft-mailer",
    name: "E-commerce Kraft Mailer",
    category: "mailers", image: mailersImg,
    description: "Tear-strip kraft mailer for online sellers. Branded inside & out.",
    moq: 250, sizes: ["A5", "A4", "A3"],
    tags: ["Discounted"],
  },
  {
    id: "p6", slug: "branded-product-labels",
    name: "Branded Product Labels",
    category: "labels", image: labelsImg,
    description: "Adhesive labels in any shape — matte, gloss or kraft finish.",
    moq: 1000, sizes: ['Round 40mm', 'Round 60mm', 'Custom die-cut'],
    tags: ["New"],
  },
  {
    id: "p7", slug: "rigid-gift-box",
    name: "Rigid Gift Box",
    category: "gifting", image: giftingImg,
    description: "Magnetic-close rigid presentation box. Ideal for corporate gifting.",
    moq: 100, sizes: ["Small", "Medium", "Large"],
    tags: ["Featured"],
  },
  {
    id: "p8", slug: "sos-grocery-bag",
    name: "SOS Grocery Bag",
    category: "bags", image: bagsImg,
    description: "Square-bottom self-opening kraft bag for groceries and takeaway.",
    moq: 1000, sizes: ["#4", "#8", "#12", "#20"],
    tags: ["Trending"],
  },
];

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function productOrderMessage(p: Product, size?: string, qty?: number) {
  return `Hi Moments Packaging, I'd like to order:\n\n• Product: ${p.name}\n• Size: ${size ?? p.sizes[0]}\n• Quantity: ${qty ?? p.moq}\n\nPlease send me a quote.`;
}
