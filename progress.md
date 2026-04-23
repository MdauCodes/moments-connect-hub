# Moments Packaging — Progress Tracker

> Living document. Update at the end of every working session so any human or
> AI agent can pick up exactly where the last one stopped.
> **Format rule:** keep statuses in the table — write narrative only under
> "Recent decisions" and "Next up".

Last updated: 2026-04-23 (backendSpec.md rewritten as a full build brief)

---

## 1. Status legend

| Symbol | Meaning |
| --- | --- |
| ✅ | Done & verified in the running app |
| 🟡 | In progress / partially built |
| ⏳ | Planned, not started |
| 🔌 | Frontend done, waiting for Spring Boot backend wire-up |
| ❌ | Explicitly out of scope for now |

---

## 2. Feature matrix

### 2.1 Public site

| Area | Status | Notes |
| --- | --- | --- |
| Landing page (hero, packaging cloud, persona gate) | ✅ | `src/routes/index.tsx` |
| Featured carousel (Deals / New / Fast-moving) | ✅ | Mocked via `isDiscount`, `isNewArrival`, `isFastMoving` flags on products. Section hides when nothing is flagged. |
| "Trusted by brands" strip | ❌ | Commented out in `index.tsx` until brand permissions are confirmed. |
| Products listing & detail | ✅ | `/products`, `/products/$slug` |
| Industries page | ✅ | `/industries` — 8 segments (F&B, Agriculture, Textile & Apparel, E-commerce & Mailers, Gifting & Events, Beauty & Personal Care, Pharma & Health, Industrial & Hardware) |
| "Industries we serve" home strip | ✅ | `IndustriesStrip` component — 8 cards link to `/products?industry=<slug>` |
| Global product search overlay | ✅ | `SearchCommand` — desktop bar + mobile icon, ⌘K / `/`, debounced, ranked, shimmer skeleton, recent + suggested queries |
| About / Contact pages | ✅ | `/about`, `/contact` |
| Persona gate ("Viewing as …") | ✅ | `PersonaContext` + `PersonaGate` |
| Basket pill + drawer | ✅ | `BasketContext`, `BasketPill`, `BasketDrawer` |
| Email capture banner (footer-stack aware) | ✅ | Auto-offsets persona pill & basket pill via `liftAbove` prop |
| Insider email capture prompt (slide-in) | ✅ | `EmailInsiderPrompt` — exit-intent + 50% scroll + 30s idle, slide-in card bottom-right, insider-led copy, 3-day re-prompt cap, suppressed once banner submitted |
| WhatsApp float | ✅ | `WhatsAppFloat` |
| Page progress bar | ✅ | `PageProgressBar` |
| Branded splash screen | ✅ | `AppSplash` — themed shimmer, navbar logo |
| SEO per-route meta + sitemap | ✅ | Each route file has `head()`; `public/sitemap.xml` updated |

### 2.2 Blog

| Area | Status | Notes |
| --- | --- | --- |
| `/blog` listing with template filters | ✅ | Filter chips: Educative, Explanatory, Scenario, Storyline, News |
| `/blog/$slug` detail page | ✅ | Per-template body renderer, OG/Twitter meta from cover image |
| Latest blogs strip on homepage | ✅ | Renders 1–5 cards depending on viewport (mobile→2xl) |
| Suggested next read | ✅ | Up to 2 random other published posts at the bottom of every detail page |
| Blog cards show author + publish date | ✅ | "Moments Packaging Director" is the default author |
| Admin blog list | ✅ | `/admin/blogs` searchable |
| Admin blog create/edit (5 templates) | ✅ | Template-aware form fields per template |
| Admin image upload — file + URL paste | ✅ | URL paste is temporary; will be replaced by Cloudinary uploads when backend is live |
| AI-generated blog drafts | ⏳ | Deferred — client requested for "later" |

### 2.3 Admin dashboard

| Area | Status | Notes |
| --- | --- | --- |
| Admin login | ✅ | `/admin/login` (mock auth via `AdminAuthContext`) |
| Admin shell + protected routes | ✅ | `_adminAuth.tsx` + `AdminProtectedRoute` |
| Role-based access control (ADMIN vs STAFF) | ✅ | Single source of truth in `src/lib/permissions.ts`. STAFF: blogs+products+enquiries CRUD, no delete, no `/admin/staff` or `/admin/settings`. Sidebar items + destructive buttons + route guards all read from the same matrix. Mirrored in `backendSpec.md` §2.1. |
| Blogs CRUD | ✅ | Full mock CRUD via `localStorage` (`blogStore`). Delete button gated by `blog:delete` (ADMIN only). |
| Products CRUD | ✅ | Full create/edit/delete via `localStorage` (`productStore`). `ProductEditor` exposes name, slug, category, price, MOQ, image (file + URL paste), description, sizes, material, finish, keywords, tags, industries, and carousel flags (`isDiscount`, `isNewArrival`, `isFastMoving`, `monthlyClicks`). Delete gated by `product:delete` (ADMIN only). |
| Enquiries inbox | ✅ | Full list + filters + detail with status flow (NEW → IN PROGRESS → CLOSED, plus extended states), assignee, internal notes, communication templates. Mock data; same shapes as `backendSpec.md` §3.5. |
| Analytics | 🟡 | Coming-soon placeholder |
| Staff management | 🟡 | Coming-soon placeholder — route exists but ADMIN-only via `staff:manage` permission |
| Settings | 🟡 | Coming-soon placeholder — route exists but ADMIN-only via `settings:manage` permission |

### 2.4 Backend integration

| Area | Status | Notes |
| --- | --- | --- |
| API contract documented | ✅ | `backendSpec.md` |
| `src/services/api.ts` wired against contract shapes | ✅ | All methods return mock data with `// TODO:` comments listing the eventual endpoint |
| JWT login + refresh | 🔌 | Frontend admin auth context is mock-only |
| Cloudinary image uploads | 🔌 | URL paste is the demo bridge |
| Real product CRUD | 🔌 | Admin CRUD persists to `localStorage` via `productStore`; public site still reads `src/data/products.ts`. Both feed the same `Product` shape, so the swap is one `api.ts` edit. |
| Real blog persistence | 🔌 | Currently `localStorage` via `blogStore` |
| Email capture + enquiry submission | 🔌 | `submitLead` / `submitEnquiry` log to console |

---

## 3. Recent decisions (newest first)

- **2026-04-23** — **`backendSpec.md` rewritten as a paste-ready build brief.** Restructured into 20 sections that an autonomous coding agent (Claude Code, Cursor, etc.) can use to build the Spring Boot backend end-to-end without follow-ups: stack + Maven coordinates + dependency list, mandatory package layout, full role/permission matrix mirrored from `src/lib/permissions.ts`, JWT auth design, full `application.yml`, three Flyway migrations with verbatim SQL (schema + industry seed + tsvector search index), every REST endpoint with required role, every DTO shape with validation rules, the search ranking algorithm with a Postgres candidate-pool query + Java re-rank strategy, two-surface lead capture contract, S3/CDN rules, ShedLock-protected scheduled jobs, error envelope, exhaustive security checklist, test pyramid with mandatory cases, observability + Prometheus metrics, multi-stage Dockerfile + docker-compose + GitHub Actions CI, frontend mapping table, and a 12-item acceptance-criteria checklist. Only 4 open questions remain (hosting target, admin seed source, SMTP provider, CDN CNAME).
- **2026-04-23** — **RBAC + admin product CRUD + enquiry triage confirmed:** introduced `src/lib/permissions.ts` as the single role/permission matrix (ADMIN = everything; STAFF = blogs+products+enquiries CRUD with no delete and no access to `/admin/staff` or `/admin/settings`). `AdminLayout` hides forbidden sidebar items, route layouts render `<Forbidden />` when `can(role, perm)` fails, and delete buttons disappear for STAFF. New `productStore` (localStorage) backs full product CRUD via `ProductEditor` covering core fields + sizes/material/finish/keywords/tags/industries + carousel flags (`isDiscount`, `isNewArrival`, `isFastMoving`, `monthlyClicks`). Enquiries page already exceeded the requested simple status flow (status + assignee + notes + templates) so it was kept as-is. Mirror this matrix in Spring Boot — see `backendSpec.md` §3.
- **2026-04-23** — **Insider email capture prompt:** new `EmailInsiderPrompt` slide-in card layered on top of the existing bottom banner. Triggers on first of (exit-intent / 50% scroll depth / 30s idle), copy is **insider-led** ("be first to know about new arrivals, trends & exclusive goodies"), shows once per 3 days, never re-shows after submit, and is fully suppressed if the user has already submitted via the bottom banner (shared `moments_email_banner` key). Same `api.submitLead(email, persona)` endpoint as the banner — no new backend contract needed. See `backendSpec.md` §10.
- **2026-04-23** — **Market segmentation:** industries expanded from 7 ad-hoc to a canonical 8-segment taxonomy (F&B, Agriculture, Textile & Apparel, E-commerce & Mailers, Gifting & Events, Beauty & Personal Care, Pharma & Health, Industrial & Hardware) with stable slugs + IDs + keywords. Added home `IndustriesStrip`, rebuilt `/industries` page, added `industry` URL search param to `/products` so industry chips and SearchCommand links share state.
- **2026-04-23** — **Global ranked search:** new `SearchCommand` overlay (desktop bar + mobile icon + ⌘K), uses dedicated `src/services/search.ts` weighted-ranking engine. Order: name → popularity (capped boost) → industry → description → category/material/finish/sizes/tags/keywords. Shimmer skeleton during fetch, recent searches in `localStorage`, suggested queries, browse-by-industry idle state. `Product` gained optional `material`, `finish`, `keywords` fields and the contract is mirrored in `backendSpec.md` §6.
- **2026-04-23** — Added "Suggested next read" block on blog detail; cards now show author + date; image URL paste added alongside file upload (temporary until Cloudinary).
- **2026-04-23** — Homepage latest-blogs strip now scales 1→2→3→4→5 columns across breakpoints; fetches up to 5 latest posts.
- **2026-04-23** — Default author across all blog flows is **"Moments Packaging Director"**.
- **2026-04-22** — Built full blog system (5 templates, CRUD, public listing, detail, homepage strip) backed by a `localStorage` mock store that mirrors the eventual Spring Boot REST contract.
- **2026-04-22** — Wrote `backendSpec.md` covering blogs + products + industries + enquiries + leads + click tracking + JWT auth + roles + Cloudinary file storage.
- **2026-04-21** — Splash screen rebuilt with navbar logo + themed shimmer (accent → kraft via `oklch`).
- **2026-04-21** — `EmailCaptureBanner` now reports visibility upward; `BasketPill` and persona "Viewing as" pill auto-lift via a `liftAbove` prop so they never overlap.
- **2026-04-21** — "Trusted by brands" section commented out pending permission from the brands.

---

## 4. Next up (priority order)

1. **Spring Boot backend kickoff** — hand `backendSpec.md` to the Java team; first vertical slice should be auth + blogs (smallest schema, already proven shape), then products, then enquiries.
2. **Wire public product list to `productStore`** — today the public site reads `src/data/products.ts` while admin writes go to `productStore`. Either merge them or wait for the real backend; pick before the next demo.
3. **Staff management screen** — replace the coming-soon panel with invite-by-email + role assignment (`ADMIN` / `STAFF`) once `/api/v1/admin/users` is live.
4. **Cloudinary / S3 integration** — once backend image-upload endpoint exists, replace the URL-paste field in `BlogEditor.tsx` and `ProductEditor.tsx` with the upload→URL response.
5. **Analytics dashboard** — replace the coming-soon panel with real product-click + enquiry charts.
6. **AI-generated blog drafts** — feature-flagged option in the blog editor that calls the Java backend's AI endpoint.

---

## 5. Known gaps / debt

- Admin auth is mock-only; do **not** ship publicly until JWT auth is wired. Role enforcement is currently UI-side only — the Spring Boot backend MUST re-check every permission server-side using the same matrix in `src/lib/permissions.ts` / `backendSpec.md` §2.1.
- Blog and product `localStorage` stores are per-browser — content created on one machine won't appear on another. Acceptable for demo, must die when backend lands.
- Public product listing still reads `src/data/products.ts`; admin product writes go to `productStore` (localStorage). The two are not yet reconciled.
- No automated tests yet. Add Vitest + Playwright after the Spring Boot backend stabilises.
- `src/routeTree.gen.ts` is auto-generated by the TanStack Router Vite plugin — never edit by hand.
