# Role-Based UI/UX Overhaul — Implementation Plan

One coherent system across 7 staff roles. Built on existing `hasPermission()` + `AdminOrdersContext`. No backend changes.

## 1. Foundation (shared utilities)

**`src/lib/roles.ts` (new)** — single source of truth:
- `STAFF_ROLE_RANK` map (SUPER_ADMIN:1 … STAFF:5)
- `STAFF_ROLE_DISPLAY` map ("Super Admin", "Supervisor", …)
- `STAFF_ROLE_COLOR` map (Tailwind classes for the badge chip)
- `canAssignTo(currentRole, targetRole)` → boolean (rank-based)
- `defaultLandingFor(role, permissions)` — extend existing helper so each role lands on the right page (Payments→/admin/queues/payment, Preparer→/admin/queues/preparation, Dispatcher→/admin/queues/dispatch, Staff→/admin/orders?mine=1)

**`src/components/admin/RoleBadge.tsx` (new)** — pill component reading from the maps above.

**`src/components/admin/HelpPanel.tsx` (new)** — collapsible "?" panel pinned top-right of admin pages. Accepts `title`, `children`. Uses shadcn `Popover` or simple disclosure. Per-page content lives in each route file.

## 2. Sidebar (AdminLayout.tsx)

- Gate every nav item strictly on permission (already partially done).
- Add **role badge** under user name/email at the bottom.
- Mobile (<768px): collapse to hamburger using shadcn `Sheet`. Trigger lives in the page header bar.
- Verify exact visibility per role:
  - SUPER_ADMIN/ADMIN: full nav
  - SUPERVISOR: Dashboard, Analytics, Orders, Users (no queues, no products, no settings, no roles)
  - PAYMENTS_CONFIRMER: Dashboard, Payment Queue
  - PREPARER: Dashboard, Preparation Queue
  - DISPATCHER: Dashboard, Dispatch Queue
  - STAFF: Orders only

## 3. Landing routing (admin.login.tsx + admin.index.tsx)

Use new `defaultLandingFor(role, perms)`:
- PAYMENTS_CONFIRMER → /admin/queues/payment
- PREPARER → /admin/queues/preparation
- DISPATCHER → /admin/queues/dispatch
- SUPERVISOR → /admin/orders
- STAFF → /admin/orders (with assigned-to-me default)
- ADMIN/SUPER_ADMIN → /admin/dashboard

## 4. Dashboard (_adminAuth.admin.dashboard.tsx)

Branch by role:
- ADMIN/SUPER_ADMIN: existing full stats + role guide help panel
- SUPERVISOR: existing stats + supervisor help
- PAYMENTS_CONFIRMER: "Awaiting verification: N" + "Verified today: N" + link
- PREPARER: count of PAYMENT_VERIFIED + IN_PRODUCTION
- DISPATCHER: count of READY_FOR_DISPATCH
- STAFF: redirect to /admin/orders

## 5. Orders page (_adminAuth.admin.orders.tsx)

- Three-way filter toggle: "All" | "Assigned to me" | "Unassigned" (gated on ORDER_ASSIGN — STAFF sees only "Mine" forced)
- Add "Assigned" column with `AssignSelect` (already exists) — filter list by hierarchy using `canAssignTo`
- STAFF: force `assignedToId === userId`, hide filter toggle, friendly empty state
- Mobile: hide low-priority columns (phone, county); keep ref/customer/total/status/assigned/action

## 6. AssignSelect.tsx update

- Filter `assignees` list by `canAssignTo(currentUserRole, u.staffRoleName)`
- Show "{Name} — {Role Display}" in options
- Show "Currently assigned to: {name} ({role})" or "Not yet assigned" above

Needs `staffRoleName` + `staffRoleDisplay` on `AssignableUser` (extend type in commerceApi.ts).

## 7. Queue pages

- **Payment** (_adminAuth.admin.queues.payment.tsx): filter to `status===PAID && paymentStatus==='PAID'`. Help panel.
- **Preparation** (_adminAuth.admin.queues.preparation.tsx): only `paymentStatus==='PAID'` AND status in [PAYMENT_VERIFIED, IN_PRODUCTION]. Switch to card layout. Two action buttons by status. Help panel.
- **Dispatch** (_adminAuth.admin.queues.dispatch.tsx): only READY_FOR_DISPATCH + PAID. Mobile cards. Help panel.

## 8. DispatchChecklist drawer

- Full-screen on mobile (sheet side="bottom" with h-screen, or side="right" w-full on mobile)
- Status badge at top
- If `DISPATCHED`: green "Already Dispatched" banner, button becomes disabled "View Details", checklist items shown locked/checked
- If `READY_FOR_DISPATCH`: single "Dispatch Order" button + confirm dialog "Dispatch {ref} to {customer}?"

## 9. Order Detail Drawer

- Supervisor: prominent Assign section with hierarchy-filtered dropdown + current assignee line
- Staff: read-only mode — hide status dropdown, assign, refund, cancel

## 10. Help panel content per page

Each route renders `<HelpPanel title="...">` with role-aware content blocks. Implemented via small helper `helpFor(page, role)` returning JSX.

## 11. Mobile responsiveness pass

- AdminLayout: hamburger Sheet sidebar <768px
- All `admin-table` wrappers: ensure horizontal scroll on mobile (already `data-admin-table-scroll`)
- Action buttons: `w-full sm:w-auto` where standalone
- Queue cards: stack vertical on mobile

## 12. Files touched / created

**New**
- src/lib/roles.ts
- src/components/admin/RoleBadge.tsx
- src/components/admin/HelpPanel.tsx
- src/components/admin/AdminMobileNav.tsx (hamburger)

**Edited**
- src/layouts/AdminLayout.tsx (sidebar gating, badge, mobile nav)
- src/lib/permissions.ts (defaultLandingFor branch by role)
- src/components/admin/AssignSelect.tsx (hierarchy filter, display role)
- src/services/commerceApi.ts (AssignableUser fields)
- src/components/admin/DispatchChecklist.tsx (mobile, dispatched state, confirm)
- src/components/admin/OrderDetailDrawer.tsx (staff read-only, supervisor assign)
- src/routes/admin.login.tsx (use new landing helper)
- src/routes/_adminAuth.admin.index.tsx (role-based redirect)
- src/routes/_adminAuth.admin.dashboard.tsx (per-role variant)
- src/routes/_adminAuth.admin.orders.tsx (3-way filter, hierarchy, staff lock, mobile cols, help)
- src/routes/_adminAuth.admin.queues.payment.tsx (card mobile, help, filter tightening)
- src/routes/_adminAuth.admin.queues.preparation.tsx (cards, help)
- src/routes/_adminAuth.admin.queues.dispatch.tsx (mobile cards, help)

## 13. Out of scope / assumptions

- Backend already returns `staffRoleName` on JWT and `/users/assignable`. If `staffRoleName` is missing on the session today we'll add it to `AdminSession` and read from the JWT claims; fall back to mapping from existing `role` ADMIN/STAFF when absent.
- "Verified today" count for Payments Confirmer dashboard: derive from existing orders array (status===PAYMENT_VERIFIED && updated today) — no new endpoint.
- No backend or schema changes. No new dependencies.
- Existing AdminOrdersContext single-fetch pattern preserved.

Ready to implement on approval.
