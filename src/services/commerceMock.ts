// ----------------------------------------------------------------------------
// Type-only module. Mock data has been removed — all admin commerce data now
// comes from the live backend via commerceApi.ts.
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
  assignedTo?: string;
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

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  segment: "RETAIL" | "WHOLESALE" | "ENTERPRISE";
  status: "VIP" | "ACTIVE" | "AT_RISK" | "DORMANT";
  lifetimeValue: number;
  ordersCount: number;
  lastOrderAt?: string;
  firstOrderAt?: string;
  averageOrderValue?: number;
  defaultAddress?: string;
  createdAt: string;
}
