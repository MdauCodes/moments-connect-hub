// ----------------------------------------------------------------------------
// Permission system — backend-aligned string constants.
//
// The backend issues JWTs with `permissions: string[]` plus a `staffRole`
// (e.g. SUPER_ADMIN, DISPATCHER). Frontend code should NEVER gate on role
// names — always gate on permissions. Role name is for display only.
//
// Legacy `can(role, permission)` API kept for back-compat; new code should
// use `hasPerm(permissions, PERM.X)` from the auth context.
// ----------------------------------------------------------------------------

export type Role = "ADMIN" | "STAFF" | "ROLE_ADMIN" | "ROLE_STAFF";

// Backend permission codes (mirror server enum).
export const PERM = {
  // Orders
  ORDER_VIEW: "ORDER_VIEW",
  ORDER_MANAGE_ALL: "ORDER_MANAGE_ALL",
  ORDER_ASSIGN: "ORDER_ASSIGN",
  ORDER_VERIFY_PAYMENT: "ORDER_VERIFY_PAYMENT",
  ORDER_PREPARE: "ORDER_PREPARE",
  ORDER_DISPATCH: "ORDER_DISPATCH",
  // Products
  PRODUCT_VIEW: "PRODUCT_VIEW",
  PRODUCT_MANAGE: "PRODUCT_MANAGE",
  // Payments
  PAYMENT_VIEW: "PAYMENT_VIEW",
  PAYMENT_REFUND: "PAYMENT_REFUND",
  // Users
  USER_VIEW: "USER_VIEW",
  USER_CREATE: "USER_CREATE",
  USER_MANAGE_ROLES: "USER_MANAGE_ROLES",
  // Analytics & settings
  ANALYTICS_VIEW: "ANALYTICS_VIEW",
  SETTINGS_MANAGE: "SETTINGS_MANAGE",
  // Content
  BLOG_MANAGE: "BLOG_MANAGE",
  ENQUIRY_VIEW: "ENQUIRY_VIEW",
  REVIEW_MODERATE: "REVIEW_MODERATE",
  CUSTOMER_VIEW: "CUSTOMER_VIEW",
} as const;

export type PermissionCode = (typeof PERM)[keyof typeof PERM];

// Pretty groups for the role editor.
export const PERMISSION_GROUPS: { label: string; perms: PermissionCode[] }[] = [
  {
    label: "Orders",
    perms: [
      PERM.ORDER_VIEW,
      PERM.ORDER_MANAGE_ALL,
      PERM.ORDER_ASSIGN,
      PERM.ORDER_VERIFY_PAYMENT,
      PERM.ORDER_PREPARE,
      PERM.ORDER_DISPATCH,
    ],
  },
  { label: "Products", perms: [PERM.PRODUCT_VIEW, PERM.PRODUCT_MANAGE] },
  { label: "Payments", perms: [PERM.PAYMENT_VIEW, PERM.PAYMENT_REFUND] },
  { label: "Users & roles", perms: [PERM.USER_VIEW, PERM.USER_CREATE, PERM.USER_MANAGE_ROLES] },
  {
    label: "Analytics & settings",
    perms: [
      PERM.ANALYTICS_VIEW,
      PERM.SETTINGS_MANAGE,
      PERM.BLOG_MANAGE,
      PERM.ENQUIRY_VIEW,
      PERM.REVIEW_MODERATE,
      PERM.CUSTOMER_VIEW,
    ],
  },
];

// Default permission bundle when the backend hasn't yet attached permissions
// to the JWT (legacy tokens). Maps role → permission list.
const ADMIN_BUNDLE: PermissionCode[] = Object.values(PERM);
const STAFF_BUNDLE: PermissionCode[] = [
  PERM.ORDER_VIEW,
  PERM.ORDER_VERIFY_PAYMENT,
  PERM.ORDER_PREPARE,
  PERM.ORDER_DISPATCH,
  PERM.PRODUCT_VIEW,
  PERM.ENQUIRY_VIEW,
  PERM.CUSTOMER_VIEW,
  PERM.REVIEW_MODERATE,
];

export function defaultPermissionsForRole(role: Role | undefined | null): PermissionCode[] {
  if (role === "ADMIN" || role === "ROLE_ADMIN") return [...ADMIN_BUNDLE];
  if (role === "STAFF" || role === "ROLE_STAFF") return [...STAFF_BUNDLE];
  return [];
}

export function hasPerm(perms: readonly string[] | undefined | null, code: PermissionCode | string): boolean {
  if (!perms || perms.length === 0) return false;
  return perms.includes(code);
}

export function hasAnyPerm(perms: readonly string[] | undefined | null, codes: (PermissionCode | string)[]): boolean {
  return codes.some((c) => hasPerm(perms, c));
}

// Compute the default admin landing page from the user's permissions + staffRole.
// staffRole takes precedence so specialist roles land directly on their queue.
export function defaultLandingFor(
  perms: readonly string[] | undefined | null,
  staffRole?: string | null,
): string {
  const r = String(staffRole ?? "").toUpperCase().replace(/^ROLE_/, "");
  if (r === "PAYMENTS_CONFIRMER") return "/admin/queues/payment";
  if (r === "PREPARER") return "/admin/queues/preparation";
  if (r === "DISPATCHER") return "/admin/queues/dispatch";
  if (r === "SUPERVISOR") return "/admin/orders";
  if (r === "STAFF") return "/admin/orders";
  if (r === "SUPER_ADMIN" || r === "ADMIN") return "/admin/dashboard";
  // Fallback by permissions
  if (hasPerm(perms, PERM.USER_MANAGE_ROLES)) return "/admin/dashboard";
  if (hasAnyPerm(perms, [PERM.ORDER_ASSIGN, PERM.ORDER_MANAGE_ALL])) return "/admin/orders";
  if (hasPerm(perms, PERM.ORDER_VERIFY_PAYMENT)) return "/admin/queues/payment";
  if (hasPerm(perms, PERM.ORDER_PREPARE)) return "/admin/queues/preparation";
  if (hasPerm(perms, PERM.ORDER_DISPATCH)) return "/admin/queues/dispatch";
  return "/admin/orders";
}

// ────────────────────────────────────────────────────────────────────────────
// Legacy permission API kept so existing routes/components still compile.
// ────────────────────────────────────────────────────────────────────────────

export type Permission =
  | "blog:create"
  | "blog:edit"
  | "blog:delete"
  | "product:create"
  | "product:edit"
  | "product:delete"
  | "enquiry:view"
  | "enquiry:update"
  | "order:view"
  | "order:update"
  | "order:refund"
  | "payment:view"
  | "payment:refund"
  | "customer:view"
  | "customer:edit"
  | "review:moderate"
  | "staff:manage"
  | "settings:manage";

const ADMIN_PERMS: Permission[] = [
  "blog:create", "blog:edit", "blog:delete",
  "product:create", "product:edit", "product:delete",
  "enquiry:view", "enquiry:update",
  "order:view", "order:update", "order:refund",
  "payment:view", "payment:refund",
  "customer:view", "customer:edit",
  "review:moderate",
  "staff:manage", "settings:manage",
];
const STAFF_PERMS: Permission[] = [
  "blog:create", "blog:edit",
  "product:create", "product:edit",
  "enquiry:view", "enquiry:update",
  "order:view", "order:update",
  "payment:view",
  "customer:view",
  "review:moderate",
];

export function permissionsFor(role: Role | undefined | null): Permission[] {
  if (role === "ADMIN" || role === "ROLE_ADMIN") return ADMIN_PERMS;
  if (role === "STAFF" || role === "ROLE_STAFF") return STAFF_PERMS;
  return [];
}
export function can(role: Role | undefined | null, permission: Permission): boolean {
  return permissionsFor(role).includes(permission);
}
