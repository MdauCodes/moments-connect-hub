# Admin Platform Overhaul — Implementation Plan

## 0. Global email update
- Replace `COMPANY_EMAIL` (and any hardcoded contact email like `hello@…`, `info@…`, `sales@…`) with `info@momentspackaging.com` across the codebase (footer, legal pages, contact page, schemas/JSON-LD, email-capture copy, transactional mock emails).

## 1. Auth & JWT (`src/contexts/AdminAuthContext.tsx`, `src/services/adminApi.ts`)
- Extend `AdminSession` with `isStaff`, `staffRole`, `staffRoleDisplay`, `permissions: string[]`, `mustChangePassword`, `userId`.
- Decode these from JWT (mock decode in dev — `adminApi` already fabricates sessions; add fields to that fabrication keyed off role).
- New `usePermissions()` hook + `hasPermission(p)` on context.
- New route `/admin/change-password` — simple form, calls `adminApi.changePassword(newPassword)` (stub: updates local session, flips `mustChangePassword=false`).
- `AdminProtectedRoute` gains a check: if `user.mustChangePassword` and path !== `/admin/change-password`, redirect there.

## 2. Permission-driven sidebar & landing (`src/layouts/AdminLayout.tsx`)
- Replace role-based `nav` filtering with permission predicates per item (mapping per spec).
- New `defaultLandingFor(permissions)` helper used by `/admin` index and post-login redirect (first-match priority list per spec).
- Hide/disable create buttons based on granular perms (`PRODUCT_MANAGE` vs `PRODUCT_VIEW`, `USER_CREATE`).

## 3. Order status — add `PAYMENT_VERIFIED`
- Update `OrderStatus` union in `src/services/orderStore.ts` + `commerceApi.ts`.
- Add to `ORDER_STATUS_OPTIONS`, badge color map (teal), timeline labels, admin status dropdown.
- Gate transitions in admin order detail by permission map (spec §3).

## 4. Three new queue routes
- `src/routes/_adminAuth.admin.queues.payment.tsx` — filter `PAID`, "Verify Payment" action with confirm dialog.
- `src/routes/_adminAuth.admin.queues.preparation.tsx` — filter `PAYMENT_VERIFIED` + `IN_PRODUCTION`, "Start Production" / "Mark Ready".
- `src/routes/_adminAuth.admin.queues.dispatch.tsx` — filter `READY_FOR_DISPATCH`, "Open Checklist".
- Each guarded by required permission via `<Forbidden>` fallback.

## 5. Dispatcher checklist (`src/components/admin/DispatchChecklist.tsx`)
- Side drawer (shadcn `Sheet`), per-item checkboxes, state in `localStorage["dispatch_checklist_{orderId}"]`.
- "Confirm & Dispatch" disabled until all ticked → opens delivery-confirmation modal (4 options) → calls mock `orderStore.dispatchConfirm()` then `updateStatus("DISPATCHED")` → clears localStorage → removes from queue.

## 6. Order assignment (supervisor)
- Extend orders with `assignedTo`, `assignedToId` (already partially present — verify).
- Admin orders list + detail: "Assign to" dropdown using `adminResources.users.listAssignable()` (new mock returning enabled staff).
- New filter "My assigned orders" on orders list.
- Visible only with `ORDER_ASSIGN`.

## 7. User & Role management
- Refactor `_adminAuth.admin.users.tsx`: drop password field from create form; show `staffRoleDisplay`; add Reset Password button; gate by `USER_MANAGE_ROLES`.
- New page `_adminAuth.admin.roles.tsx`: list/create/edit/delete custom roles, grouped permission checklist; new `adminResources.roles` + `adminResources.permissions` mock stores.

## 8. VAT display
- Extend product schema (`vatRate`, `vatExempt`) + order schema (`taxableAmount`, `vatAmount`).
- Product editor: VAT rate input + exempt toggle.
- Order detail (admin + customer), order confirmation, track-by-ref view: conditional VAT rows.
- Ensure receipt/PDF code reads new fields.

## 9. Email order tracking (`src/routes/orders.track.tsx`)
- Add `Tabs` (shadcn) — "By reference" / "By email".
- Email tab: input → `orderStore.findByEmail(email, page)` (new mock) → paginated list → expandable detail reusing existing renderer.
- Generic empty-state message regardless of cause.

## 10. Verification pass
- Smoke-test each persona by seeding mock users (SUPER_ADMIN, DISPATCHER, PAYMENTS_CONFIRMER, SUPERVISOR) in `adminApi` mock login.
- Walk through flows; fix any TS errors and broken imports.

---

## Technical notes
- Backend is mocked (`orderStore`, `adminApi`, `adminResources`). All "endpoints" become methods on these stores; localStorage is the source of truth in preview. The shape/naming will match the documented REST endpoints so a real backend can be swapped in.
- Permissions live as string constants in a new `src/lib/permissions.ts` `PERM` object (kept alongside existing role helpers — old `can()` stays for back-compat during migration).
- Sidebar gating uses a single `visibleNav(permissions)` selector — single source of truth for both sidebar render and "default landing" logic.
- No design system changes beyond adding a teal badge token for `PAYMENT_VERIFIED`.

## Questions before I start
1. **Scope of mocks**: confirm I should keep everything in the existing localStorage mock layer (no real backend wiring). Yes/no.
2. **Seed personas**: OK to add 4 demo logins (super admin / dispatcher / payments / supervisor) with fixed emails+passwords so you can test each flow? I'll list them in the final message.
3. **`USER_MANAGE_ROLES` mapping**: the spec says SUPER_ADMIN gets it. Should the existing `ROLE_ADMIN` user automatically receive `USER_MANAGE_ROLES` + all other permissions (i.e. ADMIN === SUPER_ADMIN for now)?

Once you confirm I'll execute sections 0→10 in order.