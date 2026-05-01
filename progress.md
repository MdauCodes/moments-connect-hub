# Storefront e-commerce audit (2026-05-01)

## Summary
The admin side now covers ~85% of self-serve commerce ops (orders, payments, customers,
catalog with stock/SKU/variants, analytics, CSV exports). The **storefront is still
~25% complete** for self-serve — most customer-facing commerce routes are `StubPage`
placeholders. A buyer cannot currently view a cart, check out, pay, or see their
order history.

## Severity legend
- 🔴 BLOCKER — blocks any self-serve sale
- 🟠 HIGH — required for v1 launch
- 🟡 MEDIUM — needed for retention / trust
- 🟢 LOW — polish

## Findings

### Cart & checkout (🔴 BLOCKER)
| Route | State | Notes |
|---|---|---|
| `/cart` | Stub | Empty `StubPage`. PDP "Add to cart" writes to `CartContext` but nothing displays it. |
| `/checkout` | Stub | No address form, no payment method selection, no order summary. |
| `/checkout/processing` | Stub | M-Pesa STK-push polling UI missing. |
| `/checkout/success` | Stub | No order reference, receipt, or next-steps. |
| `/checkout/failed` | Stub | No retry / alt payment CTA. |

Two parallel cart systems coexist:
- `BasketContext` (legacy) — drives the header `BasketPill` + `BasketDrawer` + WhatsApp enquiry flow.
- `CartContext` (new) — used by PDP `addItem` and header `itemCount`.
They are out of sync. Header shows `CartContext.itemCount`, but the drawer reads `BasketContext`. **Decision needed: consolidate to one.**

### Customer account (🟠 HIGH)
| Route | State |
|---|---|
| `/account/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify` | All stubs |
| `/account/dashboard` | Stub |
| `/account/profile` | Stub — no addresses, phone, defaults |
| `/account/orders` | Stub — no list of past orders |
| `/account/orders/:reference` | Stub — no detail / tracking / re-order |
| `/account/wishlist` | Stub — wishlist toggle on PDP only flips local state |
| `/orders/track` | Stub — guest order tracking absent |

### Product detail (🟡 MEDIUM — works but commerce gaps)
- ✅ Pricing tiers, MOQ, configurator, gallery, related products, click tracking.
- ❌ No stock indicator ("in stock / low stock / out of stock") even though admin now tracks `stock` + `lowStockThreshold`.
- ❌ No variant picker driven by admin `variants` (size/material combos with their own SKU/stock).
- ❌ No `compareAtPrice` strikethrough display.
- ❌ No "Buy now" express path; only "Add to cart" then dead-end `/cart`.
- ❌ Wishlist heart is purely visual (state never leaves the page).

### Catalogue (`/products`) (🟡 MEDIUM)
- ✅ Filters by category/industry/q/newArrivals/deals/fastMoving via URL search params.
- ❌ No price-range filter, no sort (price ↑/↓, popularity, newest), no "in stock only".
- ❌ Card shows `basePrice` only — no compare-at, no per-tier "from" vs "MOQ price".
- ❌ No quick-add or quick-view; user must visit PDP for everything.

### Header & global (🟡 MEDIUM)
- Header `ShoppingBag` icon links to `/cart` (stub) — breaks the "add → cart → checkout" loop.
- Mini-cart drawer (`BasketDrawer`) talks to the wrong context and only opens via the legacy `BasketPill`.
- No persistent customer login state surfaced near the cart icon (account dropdown exists but only when authed via the also-stubbed login).
- Currency hardcoded KES (good for now); no locale switching planned.

### Payments UX (🔴 BLOCKER)
- Admin now models MPESA / CARD / BANK with success/failure reasons, but the **storefront has no payment-method picker, no STK-push input, no card form, no bank instructions screen.**
- No webhook landing pages tied to the future Spring Boot callback.

### Trust, SEO, conversion (🟢 LOW)
- ✅ Meta + canonical + og tags on PDP and catalogue.
- ❌ No JSON-LD `Product` / `Offer` / `BreadcrumbList` schema → losing rich-result eligibility.
- ❌ No reviews / ratings UI even though `Star` icon imported on PDP.
- ❌ No abandoned-cart email capture; `EmailCaptureBanner` exists but isn't wired to cart events.
- ❌ No clear shipping-fee preview before reaching checkout.

## Alignment check vs admin (Phase 1–3)
| Admin capability | Storefront equivalent | Status |
|---|---|---|
| Order lifecycle (PENDING→DELIVERED) | Customer order list + tracking | ❌ Missing |
| Payment status / gateway | Checkout payment picker + result pages | ❌ Missing |
| Stock + low-stock threshold | PDP stock badge, "only N left" | ❌ Missing |
| Variants (size × material × SKU) | PDP variant matrix selector | ❌ Missing |
| `compareAtPrice` | Strikethrough on PDP & cards | ❌ Missing |
| Customer LTV / segment | Customer self-service hub | ❌ Missing (account is stubbed) |
| Refund flow | Customer-initiated refund request | ❌ Missing |
| Analytics conversion funnel | The events that feed it (view → cart → checkout) | ❌ Not emitted |

## Recommended Phase 4 — "Storefront commerce loop" (smallest set to make a sale)
1. **Real `/cart`** — list items from `CartContext`, qty editor, remove, subtotal/shipping/total, "Proceed to checkout".
2. **Real `/checkout`** — guest or logged-in, address form, shipping method, payment-method picker (M-Pesa / Card / Bank), submit → POST `/api/v1/public/orders` with mock fallback.
3. **Real `/checkout/processing`** — poll M-Pesa STK status; redirect to success/failed.
4. **Real `/checkout/success` + `/failed`** — order reference, receipt summary, retry CTA.
5. **Consolidate carts** — pick `CartContext`, retire `BasketContext`, repoint header drawer.
6. **Order tracking** — `/orders/track` (guest, by ref + email) and `/account/orders` (auth) with same mock-live hybrid pattern as admin.
7. **Auth pages** — minimal `/account/login`, `/register`, `/forgot-password` wired to `AuthContext`.

## Phase 5 — "Conversion polish"
- PDP stock badge + variant matrix + compareAtPrice strikethrough.
- Catalogue sort, price range, in-stock filter.
- Wishlist persistence + `/account/wishlist`.
- Product `Product`/`Offer` JSON-LD.
- Abandoned-cart capture wired into `EmailCaptureBanner`.

## Phase 6 — "Customer self-service & trust"
- `/account/dashboard` (recent orders, addresses, default payment).
- `/account/orders/:ref` with status timeline + re-order button.
- Refund/return request flow that lands in admin `/admin/orders/:id`.
- Reviews capture post-delivery.

## Open decisions for the user
1. **Cart consolidation**: drop `BasketContext` entirely, or keep it only as the WhatsApp-enquiry flow for non-priced enterprise items?
2. **Guest checkout**: allowed, or login-required?
3. **Payment priority**: which to wire first — M-Pesa STK only, or M-Pesa + Card simultaneously?
4. **Auth provider for the storefront**: same Spring Boot as admin, or Lovable Cloud for the customer side?
