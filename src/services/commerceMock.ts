// ----------------------------------------------------------------------------
// Deterministic mock e-commerce data (orders, payments, dashboard stats).
// Used as a fallback when the Spring Boot backend endpoints are not yet
// available. Once the real endpoints exist they take priority automatically
// — see commerceApi.ts which tries the network first and only falls back here.
// ----------------------------------------------------------------------------

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED"
  | "ON_HOLD";

export type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING" | "REFUNDED";
export type PaymentGateway = "MPESA" | "CARD" | "BANK";

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  imageUrl?: string;
}

export interface OrderRecord {
  id: string;
  reference: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentGateway: PaymentGateway;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: "KES";
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  reference: string;
  orderReference: string;
  gateway: PaymentGateway;
  status: PaymentStatus;
  amount: number;
  currency: "KES";
  customerName: string;
  customerPhone?: string;
  gatewayReference?: string;
  failureReason?: string;
  createdAt: string;
}

export interface DashboardStats {
  revenueToday: number;
  revenueYesterday: number;
  revenue7d: number;
  revenue30d: number;
  ordersToday: number;
  ordersPending: number;
  ordersFailed: number;
  paymentSuccessRate24h: number;
  lowStockCount: number;
  newCustomers7d: number;
  averageOrderValue7d: number;
  revenueSeries7d: { date: string; revenue: number; orders: number }[];
  topProducts: { productId: string; name: string; unitsSold: number; revenue: number }[];
  recentOrders: OrderRecord[];
  failedPayments: PaymentRecord[];
  lowStockProducts: { productId: string; name: string; stock: number; threshold: number }[];
}

const PRODUCTS = [
  { id: "p-kraft-bag-md", name: "Kraft Paper Bag — Medium", price: 35 },
  { id: "p-kraft-bag-lg", name: "Kraft Paper Bag — Large", price: 55 },
  { id: "p-pizza-box-12", name: "Pizza Box 12\"", price: 45 },
  { id: "p-burger-box", name: "Burger Box — Kraft", price: 18 },
  { id: "p-cup-8oz", name: "Paper Cup 8oz", price: 8 },
  { id: "p-cup-12oz", name: "Paper Cup 12oz", price: 11 },
  { id: "p-cake-box-6", name: "Cake Box 6\"", price: 90 },
  { id: "p-window-box", name: "Window Pastry Box", price: 32 },
  { id: "p-takeaway-md", name: "Takeaway Container — Medium", price: 22 },
  { id: "p-cutlery-set", name: "Wooden Cutlery Set", price: 15 },
];

const CUSTOMERS = [
  { name: "Amina Wanjiru", email: "amina.w@gmail.com", phone: "+254712345001", city: "Nairobi", addr: "Westlands, Suite 4B" },
  { name: "Brian Otieno", email: "brian.o@yahoo.com", phone: "+254722345002", city: "Kisumu", addr: "Milimani Estate" },
  { name: "Java House — Kilimani", email: "ops@javahouse.co.ke", phone: "+254733345003", city: "Nairobi", addr: "Yaya Centre" },
  { name: "Catherine Njeri", email: "cnjeri@outlook.com", phone: "+254744345004", city: "Nakuru", addr: "Section 58" },
  { name: "Pizza Hub Mombasa", email: "orders@pizzahub.ke", phone: "+254755345005", city: "Mombasa", addr: "Nyali Centre" },
  { name: "David Kiprop", email: "dkiprop@gmail.com", phone: "+254766345006", city: "Eldoret", addr: "Pioneer Estate" },
  { name: "Sweet Cravings Bakery", email: "hello@sweetcravings.co.ke", phone: "+254777345007", city: "Nairobi", addr: "Lavington Mall" },
  { name: "Faith Mutindi", email: "faithm@gmail.com", phone: "+254788345008", city: "Machakos", addr: "Town Centre" },
  { name: "Coast Coffee Roasters", email: "buy@coastcoffee.co.ke", phone: "+254799345009", city: "Mombasa", addr: "Mtwapa" },
  { name: "George Mwangi", email: "g.mwangi@gmail.com", phone: "+254700345010", city: "Thika", addr: "Section 9" },
];

// Simple seeded RNG so the same data renders across reloads.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const ORDER_STATUSES: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
const STATUS_WEIGHTS: Record<OrderStatus, number> = {
  PENDING: 8, PAID: 14, PROCESSING: 12, PACKED: 8, SHIPPED: 10, DELIVERED: 38, CANCELLED: 6, REFUNDED: 3, ON_HOLD: 1,
};

function pickWeighted<T extends string>(rng: () => number, weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [k, w] of entries) {
    if ((r -= w) <= 0) return k;
  }
  return entries[0][0];
}

function paymentStatusFor(status: OrderStatus, rng: () => number): PaymentStatus {
  if (status === "PENDING") return rng() < 0.3 ? "FAILED" : "PENDING";
  if (status === "CANCELLED") return rng() < 0.4 ? "FAILED" : "PENDING";
  if (status === "REFUNDED") return "REFUNDED";
  return "SUCCESS";
}

function generateOrders(count = 60): OrderRecord[] {
  const rng = seeded(42);
  const now = Date.now();
  const orders: OrderRecord[] = [];
  for (let i = 0; i < count; i++) {
    const customer = CUSTOMERS[Math.floor(rng() * CUSTOMERS.length)];
    const status = pickWeighted(rng, STATUS_WEIGHTS);
    const itemCount = 1 + Math.floor(rng() * 4);
    const items: OrderItem[] = [];
    const used = new Set<string>();
    for (let j = 0; j < itemCount; j++) {
      let p = PRODUCTS[Math.floor(rng() * PRODUCTS.length)];
      let guard = 0;
      while (used.has(p.id) && guard++ < 5) p = PRODUCTS[Math.floor(rng() * PRODUCTS.length)];
      used.add(p.id);
      const qty = 50 + Math.floor(rng() * 450);
      items.push({ productId: p.id, name: p.name, qty, unitPrice: p.price });
    }
    const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
    const shippingFee = subtotal > 5000 ? 0 : 350;
    const total = subtotal + shippingFee;
    const ageDays = Math.floor(rng() * 30);
    const created = new Date(now - ageDays * 86_400_000 - Math.floor(rng() * 86_400_000));
    const ref = `MP-${(10000 + i).toString()}`;
    const gateway: PaymentGateway = rng() < 0.7 ? "MPESA" : rng() < 0.85 ? "CARD" : "BANK";
    orders.push({
      id: `ord-${i + 1}`,
      reference: ref,
      status,
      paymentStatus: paymentStatusFor(status, rng),
      paymentGateway: gateway,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      shippingAddress: customer.addr,
      city: customer.city,
      items,
      subtotal,
      shippingFee,
      total,
      currency: "KES",
      createdAt: created.toISOString(),
      updatedAt: created.toISOString(),
      trackingNumber: ["SHIPPED", "DELIVERED"].includes(status) ? `TRK${100000 + i}` : undefined,
    });
  }
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function generatePayments(orders: OrderRecord[]): PaymentRecord[] {
  const rng = seeded(7);
  const payments: PaymentRecord[] = [];
  orders.forEach((o, i) => {
    payments.push({
      id: `pay-${i + 1}`,
      reference: `PMT-${(20000 + i).toString()}`,
      orderReference: o.reference,
      gateway: o.paymentGateway,
      status: o.paymentStatus,
      amount: o.total,
      currency: "KES",
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      gatewayReference:
        o.paymentGateway === "MPESA"
          ? `Q${Math.floor(rng() * 1e9).toString(36).toUpperCase()}`
          : o.paymentGateway === "CARD"
            ? `ch_${Math.floor(rng() * 1e10).toString(16)}`
            : `BK${Math.floor(rng() * 1e8)}`,
      failureReason: o.paymentStatus === "FAILED"
        ? ["Insufficient funds", "User cancelled STK push", "Timeout waiting for PIN", "Card declined by issuer"][Math.floor(rng() * 4)]
        : undefined,
      createdAt: o.createdAt,
    });
  });
  return payments;
}

const ORDERS = generateOrders();
const PAYMENTS = generatePayments(ORDERS);

export function listOrdersMock(params: { status?: string; q?: string; page?: number; size?: number } = {}) {
  const page = params.page ?? 0;
  const size = params.size ?? 20;
  let rows = ORDERS;
  if (params.status && params.status !== "ALL") rows = rows.filter((o) => o.status === params.status);
  if (params.q) {
    const q = params.q.toLowerCase();
    rows = rows.filter((o) => o.reference.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerEmail.toLowerCase().includes(q));
  }
  const total = rows.length;
  const slice = rows.slice(page * size, page * size + size);
  return { rows: slice, total, totalPages: Math.max(1, Math.ceil(total / size)) };
}

export function getOrderMock(id: string): OrderRecord | undefined {
  return ORDERS.find((o) => o.id === id || o.reference === id);
}

export function listPaymentsMock(params: { status?: string; gateway?: string; q?: string; page?: number; size?: number } = {}) {
  const page = params.page ?? 0;
  const size = params.size ?? 20;
  let rows = PAYMENTS;
  if (params.status && params.status !== "ALL") rows = rows.filter((p) => p.status === params.status);
  if (params.gateway && params.gateway !== "ALL") rows = rows.filter((p) => p.gateway === params.gateway);
  if (params.q) {
    const q = params.q.toLowerCase();
    rows = rows.filter((p) => p.reference.toLowerCase().includes(q) || p.orderReference.toLowerCase().includes(q) || p.customerName.toLowerCase().includes(q));
  }
  const total = rows.length;
  const slice = rows.slice(page * size, page * size + size);
  return { rows: slice, total, totalPages: Math.max(1, Math.ceil(total / size)) };
}

export function dashboardStatsMock(): DashboardStats {
  const now = Date.now();
  const dayStart = (offset: number) => {
    const d = new Date(now - offset * 86_400_000);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const ordersInRange = (start: number, end: number) =>
    ORDERS.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= start && t < end && ["PAID", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED"].includes(o.status);
    });

  const today = ordersInRange(dayStart(0), now + 1);
  const yesterday = ordersInRange(dayStart(1), dayStart(0));
  const last7 = ordersInRange(dayStart(7), now + 1);
  const last30 = ordersInRange(dayStart(30), now + 1);

  const series7d = Array.from({ length: 7 }).map((_, idx) => {
    const i = 6 - idx;
    const start = dayStart(i);
    const end = dayStart(i - 1);
    const dayOrders = ordersInRange(start, end);
    const d = new Date(start);
    return {
      date: d.toLocaleDateString("en-KE", { weekday: "short" }),
      revenue: dayOrders.reduce((s, o) => s + o.total, 0),
      orders: dayOrders.length,
    };
  });

  // top products from last 30 days
  const productAgg = new Map<string, { name: string; units: number; revenue: number }>();
  last30.forEach((o) =>
    o.items.forEach((it) => {
      const cur = productAgg.get(it.productId) ?? { name: it.name, units: 0, revenue: 0 };
      cur.units += it.qty;
      cur.revenue += it.qty * it.unitPrice;
      productAgg.set(it.productId, cur);
    }),
  );
  const topProducts = Array.from(productAgg.entries())
    .map(([productId, v]) => ({ productId, name: v.name, unitsSold: v.units, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const last24h = PAYMENTS.filter((p) => new Date(p.createdAt).getTime() > now - 86_400_000);
  const successCount = last24h.filter((p) => p.status === "SUCCESS").length;
  const successRate = last24h.length ? (successCount / last24h.length) * 100 : 0;

  const lowStockProducts = [
    { productId: "p-kraft-bag-md", name: "Kraft Paper Bag — Medium", stock: 18, threshold: 100 },
    { productId: "p-cup-12oz", name: "Paper Cup 12oz", stock: 42, threshold: 200 },
    { productId: "p-window-box", name: "Window Pastry Box", stock: 7, threshold: 50 },
    { productId: "p-cutlery-set", name: "Wooden Cutlery Set", stock: 0, threshold: 100 },
  ];

  return {
    revenueToday: today.reduce((s, o) => s + o.total, 0),
    revenueYesterday: yesterday.reduce((s, o) => s + o.total, 0),
    revenue7d: last7.reduce((s, o) => s + o.total, 0),
    revenue30d: last30.reduce((s, o) => s + o.total, 0),
    ordersToday: today.length,
    ordersPending: ORDERS.filter((o) => o.status === "PENDING").length,
    ordersFailed: PAYMENTS.filter((p) => p.status === "FAILED" && new Date(p.createdAt).getTime() > now - 86_400_000).length,
    paymentSuccessRate24h: Math.round(successRate * 10) / 10,
    lowStockCount: lowStockProducts.filter((p) => p.stock < p.threshold).length,
    newCustomers7d: 23,
    averageOrderValue7d: last7.length ? Math.round(last7.reduce((s, o) => s + o.total, 0) / last7.length) : 0,
    revenueSeries7d: series7d,
    topProducts,
    recentOrders: ORDERS.slice(0, 6),
    failedPayments: PAYMENTS.filter((p) => p.status === "FAILED").slice(0, 5),
    lowStockProducts,
  };
}

export function updateOrderStatusMock(id: string, status: OrderStatus): OrderRecord | undefined {
  const o = ORDERS.find((x) => x.id === id || x.reference === id);
  if (!o) return undefined;
  o.status = status;
  o.updatedAt = new Date().toISOString();
  if (status === "REFUNDED") o.paymentStatus = "REFUNDED";
  return o;
}

// ---------------------------------------------------------------------------
// Customers (Phase 2) — derived from existing orders so totals stay coherent.
// ---------------------------------------------------------------------------

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  defaultAddress: string;
  ordersCount: number;
  lifetimeValue: number;
  averageOrderValue: number;
  lastOrderAt: string | null;
  firstOrderAt: string | null;
  status: "ACTIVE" | "AT_RISK" | "DORMANT" | "VIP";
  segment: "RETAIL" | "WHOLESALE" | "ENTERPRISE";
  notes?: string;
}

function buildCustomers(): CustomerRecord[] {
  const byEmail = new Map<string, CustomerRecord & { _orderDates: number[] }>();
  ORDERS.forEach((o) => {
    const key = o.customerEmail;
    const t = new Date(o.createdAt).getTime();
    const cur = byEmail.get(key);
    if (cur) {
      cur.ordersCount += 1;
      cur.lifetimeValue += o.total;
      cur._orderDates.push(t);
    } else {
      byEmail.set(key, {
        id: `cust-${byEmail.size + 1}`,
        name: o.customerName,
        email: o.customerEmail,
        phone: o.customerPhone,
        city: o.city,
        defaultAddress: o.shippingAddress,
        ordersCount: 1,
        lifetimeValue: o.total,
        averageOrderValue: 0,
        lastOrderAt: null,
        firstOrderAt: null,
        status: "ACTIVE",
        segment: o.customerEmail.match(/restaurant|hub|bakery|coffee|java|pizza|sweet|coast/i) ? "WHOLESALE" : "RETAIL",
        _orderDates: [t],
      });
    }
  });
  const now = Date.now();
  return Array.from(byEmail.values()).map((c) => {
    const dates = c._orderDates.sort((a, b) => a - b);
    const lastOrderAt = new Date(dates[dates.length - 1]).toISOString();
    const firstOrderAt = new Date(dates[0]).toISOString();
    const ageDays = (now - dates[dates.length - 1]) / 86_400_000;
    const status: CustomerRecord["status"] =
      c.lifetimeValue > 100_000 ? "VIP" : ageDays > 21 ? "DORMANT" : ageDays > 10 ? "AT_RISK" : "ACTIVE";
    const segment: CustomerRecord["segment"] = c.lifetimeValue > 250_000 ? "ENTERPRISE" : c.segment;
    const { _orderDates, ...rest } = c;
    void _orderDates;
    return {
      ...rest,
      averageOrderValue: Math.round(c.lifetimeValue / c.ordersCount),
      lastOrderAt,
      firstOrderAt,
      status,
      segment,
    };
  }).sort((a, b) => b.lifetimeValue - a.lifetimeValue);
}

const CUSTOMERS_DERIVED = buildCustomers();

export function listCustomersMock(params: { q?: string; status?: string; segment?: string; page?: number; size?: number } = {}) {
  const page = params.page ?? 0;
  const size = params.size ?? 20;
  let rows = CUSTOMERS_DERIVED;
  if (params.status && params.status !== "ALL") rows = rows.filter((c) => c.status === params.status);
  if (params.segment && params.segment !== "ALL") rows = rows.filter((c) => c.segment === params.segment);
  if (params.q) {
    const q = params.q.toLowerCase();
    rows = rows.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q));
  }
  const total = rows.length;
  const slice = rows.slice(page * size, page * size + size);
  return { rows: slice, total, totalPages: Math.max(1, Math.ceil(total / size)) };
}

export function getCustomerMock(id: string): { customer: CustomerRecord | undefined; orders: OrderRecord[] } {
  const customer = CUSTOMERS_DERIVED.find((c) => c.id === id || c.email === id);
  if (!customer) return { customer: undefined, orders: [] };
  const orders = ORDERS.filter((o) => o.customerEmail === customer.email)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { customer, orders };
}
