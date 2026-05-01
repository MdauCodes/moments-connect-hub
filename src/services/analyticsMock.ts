// ----------------------------------------------------------------------------
// Analytics mock data — derived from the same deterministic order/payment
// pool in commerceMock so totals stay coherent across screens.
// ----------------------------------------------------------------------------
import { listOrdersMock, listPaymentsMock, type OrderRecord, type PaymentRecord } from "@/services/commerceMock";

export interface RevenuePoint { date: string; iso: string; revenue: number; orders: number; aov: number }
export interface ChannelBreakdown { channel: string; revenue: number; orders: number; share: number }
export interface CategoryBreakdown { category: string; revenue: number; units: number }
export interface FunnelStep { stage: string; value: number; pct: number }
export interface CityBreakdown { city: string; orders: number; revenue: number }
export interface PaymentMethodBreakdown { gateway: string; success: number; failed: number; revenue: number; successRate: number }

export interface AnalyticsOverview {
  range: { start: string; end: string; days: number };
  kpis: {
    revenue: number;
    revenuePrev: number;
    orders: number;
    ordersPrev: number;
    customers: number;
    aov: number;
    conversionRate: number;
    refundRate: number;
    cartAbandonRate: number;
    paymentSuccessRate: number;
  };
  revenueSeries: RevenuePoint[];
  channels: ChannelBreakdown[];
  categories: CategoryBreakdown[];
  funnel: FunnelStep[];
  topCities: CityBreakdown[];
  paymentMethods: PaymentMethodBreakdown[];
  topProducts: { productId: string; name: string; units: number; revenue: number }[];
}

const REVENUE_STATUSES = ["PAID", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED"];

function dayKey(d: Date) {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime();
}

export function analyticsOverviewMock(days = 30): AnalyticsOverview {
  const allOrders: OrderRecord[] = listOrdersMock({ size: 1000 }).rows;
  const allPayments: PaymentRecord[] = listPaymentsMock({ size: 1000 }).rows;
  const now = Date.now();
  const start = now - days * 86_400_000;
  const prevStart = start - days * 86_400_000;

  const inRange = allOrders.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    return t >= start && t <= now;
  });
  const revenueOrders = inRange.filter((o) => REVENUE_STATUSES.includes(o.status));
  const prevRevenueOrders = allOrders.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    return t >= prevStart && t < start && REVENUE_STATUSES.includes(o.status);
  });

  const revenue = revenueOrders.reduce((s, o) => s + o.total, 0);
  const revenuePrev = prevRevenueOrders.reduce((s, o) => s + o.total, 0);

  // Daily series
  const buckets = new Map<number, { revenue: number; orders: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const k = dayKey(new Date(now - i * 86_400_000));
    buckets.set(k, { revenue: 0, orders: 0 });
  }
  revenueOrders.forEach((o) => {
    const k = dayKey(new Date(o.createdAt));
    const cur = buckets.get(k);
    if (cur) { cur.revenue += o.total; cur.orders += 1; }
  });
  const revenueSeries: RevenuePoint[] = Array.from(buckets.entries()).map(([k, v]) => {
    const d = new Date(k);
    return {
      iso: d.toISOString(),
      date: d.toLocaleDateString("en-KE", { month: "short", day: "2-digit" }),
      revenue: v.revenue,
      orders: v.orders,
      aov: v.orders ? Math.round(v.revenue / v.orders) : 0,
    };
  });

  // Channels (simulate web/mobile/wholesale split deterministically)
  const channelMap: Record<string, { revenue: number; orders: number }> = {
    "Web Storefront": { revenue: 0, orders: 0 },
    "Mobile Web": { revenue: 0, orders: 0 },
    "Wholesale Portal": { revenue: 0, orders: 0 },
    "Sales Rep (manual)": { revenue: 0, orders: 0 },
  };
  revenueOrders.forEach((o, idx) => {
    const ch = idx % 7 === 0 ? "Sales Rep (manual)"
             : o.total > 30_000 ? "Wholesale Portal"
             : idx % 3 === 0 ? "Mobile Web"
             : "Web Storefront";
    channelMap[ch].revenue += o.total;
    channelMap[ch].orders += 1;
  });
  const channels: ChannelBreakdown[] = Object.entries(channelMap).map(([channel, v]) => ({
    channel, revenue: v.revenue, orders: v.orders,
    share: revenue ? Math.round((v.revenue / revenue) * 1000) / 10 : 0,
  })).sort((a, b) => b.revenue - a.revenue);

  // Categories (derive crude category from product name keywords)
  const catMap = new Map<string, { revenue: number; units: number }>();
  const categorize = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("bag")) return "Bags";
    if (n.includes("box")) return "Boxes";
    if (n.includes("cup")) return "Cups";
    if (n.includes("cutlery")) return "Cutlery";
    if (n.includes("container")) return "Containers";
    return "Other";
  };
  revenueOrders.forEach((o) => o.items.forEach((it) => {
    const cat = categorize(it.name);
    const cur = catMap.get(cat) ?? { revenue: 0, units: 0 };
    cur.revenue += it.qty * it.unitPrice;
    cur.units += it.qty;
    catMap.set(cat, cur);
  }));
  const categories: CategoryBreakdown[] = Array.from(catMap.entries())
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  // Conversion funnel (simulated upstream visits)
  const placedOrders = inRange.length;
  const checkoutStarts = Math.round(placedOrders * 1.65);
  const addToCarts = Math.round(checkoutStarts * 1.9);
  const productViews = Math.round(addToCarts * 4.2);
  const sessions = Math.round(productViews * 2.1);
  const completed = revenueOrders.length;
  const funnelRaw = [
    { stage: "Sessions", value: sessions },
    { stage: "Product views", value: productViews },
    { stage: "Add to cart", value: addToCarts },
    { stage: "Checkout started", value: checkoutStarts },
    { stage: "Order placed", value: placedOrders },
    { stage: "Order paid", value: completed },
  ];
  const top = funnelRaw[0].value || 1;
  const funnel: FunnelStep[] = funnelRaw.map((s) => ({ ...s, pct: Math.round((s.value / top) * 1000) / 10 }));

  // Cities
  const cityMap = new Map<string, { orders: number; revenue: number }>();
  revenueOrders.forEach((o) => {
    const cur = cityMap.get(o.city) ?? { orders: 0, revenue: 0 };
    cur.orders += 1; cur.revenue += o.total;
    cityMap.set(o.city, cur);
  });
  const topCities = Array.from(cityMap.entries())
    .map(([city, v]) => ({ city, ...v }))
    .sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  // Payment methods
  const payInRange = allPayments.filter((p) => new Date(p.createdAt).getTime() >= start);
  const pmMap = new Map<string, { success: number; failed: number; revenue: number }>();
  payInRange.forEach((p) => {
    const cur = pmMap.get(p.gateway) ?? { success: 0, failed: 0, revenue: 0 };
    if (p.status === "SUCCESS") { cur.success += 1; cur.revenue += p.amount; }
    if (p.status === "FAILED") cur.failed += 1;
    pmMap.set(p.gateway, cur);
  });
  const paymentMethods: PaymentMethodBreakdown[] = Array.from(pmMap.entries()).map(([gateway, v]) => {
    const total = v.success + v.failed;
    return { gateway, ...v, successRate: total ? Math.round((v.success / total) * 1000) / 10 : 0 };
  }).sort((a, b) => b.revenue - a.revenue);

  // Top products
  const prodMap = new Map<string, { name: string; units: number; revenue: number }>();
  revenueOrders.forEach((o) => o.items.forEach((it) => {
    const cur = prodMap.get(it.productId) ?? { name: it.name, units: 0, revenue: 0 };
    cur.units += it.qty; cur.revenue += it.qty * it.unitPrice;
    prodMap.set(it.productId, cur);
  }));
  const topProducts = Array.from(prodMap.entries())
    .map(([productId, v]) => ({ productId, ...v }))
    .sort((a, b) => b.revenue - a.revenue).slice(0, 8);

  const successPay = payInRange.filter((p) => p.status === "SUCCESS").length;
  const totalPay = payInRange.length || 1;
  const refundedOrders = inRange.filter((o) => o.status === "REFUNDED").length;
  const cancelledOrders = inRange.filter((o) => o.status === "CANCELLED").length;

  const customers = new Set(revenueOrders.map((o) => o.customerEmail)).size;

  return {
    range: { start: new Date(start).toISOString(), end: new Date(now).toISOString(), days },
    kpis: {
      revenue,
      revenuePrev,
      orders: revenueOrders.length,
      ordersPrev: prevRevenueOrders.length,
      customers,
      aov: revenueOrders.length ? Math.round(revenue / revenueOrders.length) : 0,
      conversionRate: sessions ? Math.round((completed / sessions) * 10000) / 100 : 0,
      refundRate: inRange.length ? Math.round((refundedOrders / inRange.length) * 1000) / 10 : 0,
      cartAbandonRate: addToCarts ? Math.round(((addToCarts - placedOrders) / addToCarts) * 1000) / 10 : 0,
      paymentSuccessRate: Math.round((successPay / totalPay) * 1000) / 10,
    },
    revenueSeries,
    channels,
    categories,
    funnel,
    topCities,
    paymentMethods,
    topProducts,
  };
}
