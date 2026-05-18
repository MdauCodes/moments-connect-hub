# Implementation Plan

## Scope
Three workstreams: (1) UOM frontend rollout, (2) OWN_COURIER delivery journey + county dropdown, (3) SEO ranking improvements.

---

## CHANGE 1 — UOM System

### 1a. New service & types
- Create `src/services/uomService.ts`
  - `fetchPublicUoms(): Promise<Uom[]>` → GET `/api/v1/public/uoms`
  - `adminCreateUom(body)` → POST `/api/v1/admin/uoms`
- Extend `Product.pricingTiers` type in `src/data/products.ts` with: `uomId`, `uomCode`, `uomName`, `uomDescription`, `enabled`.

### 1b. ProductCard.tsx
- Replace tier pill label `t.collectionName` → `t.uomName ?? t.collectionName`.
- Add tooltip (Radix Tooltip) on each pill showing `uomDescription`.
- Under active tier price, show `uomDescription` as muted sub-label.
- "Save X% vs {smallestTier.uomName}" label updated.

### 1c. ConfiguratorModal.tsx
- Tier buttons use `uomName`.
- Show `uomDescription` as small text under each tier button.
- Quantity label: `Number of ${uomName}s`.
- Units line: `× ${quantity} pieces each`.

### 1d. products.$slug.tsx
- "Choose how to buy" section: same UOM relabel + description.

### 1e. ProductEditor.tsx (admin)
- On mount fetch UOMs via `fetchPublicUoms`.
- Each tier row gets:
  - UOM `<Select>` (sets `uomId`; auto-fills `collectionName` from UOM name but editable).
  - `uomDescription` text input.
  - `enabled` toggle (Switch).
- Payload includes `uomId, collectionName, uomDescription, quantity, pricePerUnit, enabled, sortOrder`.
- Bottom "Manage UOMs" button opens a small dialog with form (code, name, description) → POST admin endpoint, then refresh list.

---

## CHANGE 2 — Fulfillment & Counties

### 2a. Kenya counties
- Create `src/data/kenyaCounties.ts` exporting the 47-county array (Nairobi first, then alphabetical).
- Create `src/components/CountySelect.tsx` — searchable Combobox (shadcn Command + Popover) usable anywhere a county is collected.

### 2b. checkout.tsx — fulfillment selector
- Add three-option fulfillment selector at top of delivery section: PICKUP, OWN_COURIER, ZONE_DELIVERY.
- PICKUP: hide address/city/county/courier fields, show pickup notice, deliveryFee = 0.
- OWN_COURIER:
  - Courier type pills: Matatu | Parcel Service | Bolt Send | Rider | Other.
  - If "Other": show `courierServiceName` text field.
  - Optional `courierStageOrOffice` input with helper text.
  - Required address + county (via CountySelect).
  - Info banner (prominent) + secondary "coming soon" muted note.
  - Order summary: delivery row shows "KES 0 / To be confirmed".
- ZONE_DELIVERY: existing flow, county via CountySelect.

### 2c. orderStore.ts
- Extend `PlaceOrderInput` and outgoing payload with `fulfillmentType`, `courierType`, `courierServiceName`, `courierStageOrOffice`. Extend `CustomerOrder` type to surface these on read.

### 2d. OrderDetailDrawer.tsx + AdminOrderDetailPage
- If `fulfillmentType === "OWN_COURIER"`, render "Courier details" section with the three fields + banner.

### 2e. order-confirmation.tsx
- Branch copy when fulfillmentType is OWN_COURIER.

---

## CHANGE 3 — SEO

- Audit `src/routes/index.tsx`, `products.tsx`, `products.$slug.tsx`, `about.tsx`, `contact.tsx`, `industries.tsx`, `blog.index.tsx`, `blog.$slug.tsx` to ensure each `head()` defines: unique `<title>` <60 chars, meta description <160 chars, canonical, og:title, og:description, og:image (leaf-level), twitter card.
- Add JSON-LD:
  - `Organization` + `WebSite` on home.
  - `Product` schema (with offers, price, availability) on product detail.
  - `BreadcrumbList` on category/product/blog pages.
  - `Article` schema on blog detail.
  - `LocalBusiness` on contact.
- Ensure single H1 per route (audit, fix any duplicates).
- Confirm `public/sitemap.xml` and `public/robots.txt` reference `https://momentspackaging.com` correctly; add `Sitemap:` line in robots.txt if missing.
- Verify hero image already has fetchPriority/width/height (done last turn). Add `loading="lazy"` + `decoding="async"` to below-the-fold images where missing.
- Add `alt` text audits on product images.

---

## Out of scope (will note to user)
- Backend endpoints (already shipped per user).
- I will NOT implement the actual UOM admin custom-creation modal styling beyond a basic Dialog — it's a utility surface.

## Verification
- Read each modified file post-edit; check build output errors only if reported.
- Spot-check checkout flow logic by re-reading branching.
