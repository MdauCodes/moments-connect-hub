// ----------------------------------------------------------------------------
// Role-based permission helpers.
//
// Two roles exist today: ADMIN and STAFF. The matrix below is the single
// source of truth — UI guards and route guards both read from it. Mirror this
// in the Spring Boot backend (see backendSpec.md §5 "Roles & permissions").
//
// STAFF policy (per current product decision):
//   • Operational access: blogs CRUD (no delete), products CRUD (no delete),
//     enquiries view + status changes + notes.
//   • Cannot reach: /admin/staff, /admin/settings.
//   • Cannot delete: blogs, products.
// ADMIN: everything.
// ----------------------------------------------------------------------------

export type Role = "ADMIN" | "STAFF" | "ROLE_ADMIN" | "ROLE_STAFF";

export type Permission =
  // Blogs
  | "blog:create"
  | "blog:edit"
  | "blog:delete"
  // Products
  | "product:create"
  | "product:edit"
  | "product:delete"
  // Enquiries
  | "enquiry:view"
  | "enquiry:update"
  // Staff & settings
  | "staff:manage"
  | "settings:manage";

const ADMIN_PERMS: Permission[] = [
  "blog:create",
  "blog:edit",
  "blog:delete",
  "product:create",
  "product:edit",
  "product:delete",
  "enquiry:view",
  "enquiry:update",
  "staff:manage",
  "settings:manage",
];

const STAFF_PERMS: Permission[] = [
  "blog:create",
  "blog:edit",
  // NO blog:delete
  "product:create",
  "product:edit",
  // NO product:delete
  "enquiry:view",
  "enquiry:update",
  // NO staff:manage, NO settings:manage
];

export function permissionsFor(role: Role | undefined | null): Permission[] {
  if (role === "ADMIN" || role === "ROLE_ADMIN") return ADMIN_PERMS;
  if (role === "STAFF" || role === "ROLE_STAFF") return STAFF_PERMS;
  return [];
}

export function can(role: Role | undefined | null, permission: Permission): boolean {
  return permissionsFor(role).includes(permission);
}
