# Moments Packaging — Progress Tracker

> Living document. Update at the end of every working session so any human or
> AI agent can pick up exactly where the last one stopped.
> **Format rule:** keep statuses in the table — write narrative only under
> "Recent decisions" and "Next up".

Last updated: 2026-04-23

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
| Industries page | ✅ | `/industries` |
| About / Contact pages | ✅ | `/about`, `/contact` |
| Persona gate ("Viewing as …") | ✅ | `PersonaContext` + `PersonaGate` |
| Basket pill + drawer | ✅ | `BasketContext`, `BasketPill`, `BasketDrawer` |
| Email capture banner (footer-stack aware) | ✅ | Auto-offsets persona pill & basket pill via `liftAbove` prop |
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
| Blogs CRUD | ✅ | Full mock CRUD via `localStorage` (`blogStore`) |
| Products management | 🟡 | Page scaffolded, no edit/create yet |
| Enquiries inbox | 🟡 | List + detail scaffolded, no real backend |
| Analytics | 🟡 | Coming-soon placeholder |
| Staff management | 🟡 | Coming-soon placeholder |
| Settings | 🟡 | Coming-soon placeholder |

### 2.4 Backend integration

| Area | Status | Notes |
| --- | --- | --- |
| API contract documented | ✅ | `backendSpec.md` |
| `src/services/api.ts` wired against contract shapes | ✅ | All methods return mock data with `// TODO:` comments listing the eventual endpoint |
| JWT login + refresh | 🔌 | Frontend admin auth context is mock-only |
| Cloudinary image uploads | 🔌 | URL paste is the demo bridge |
| Real product CRUD | 🔌 | Currently reads `src/data/products.ts` |
| Real blog persistence | 🔌 | Currently `localStorage` via `blogStore` |
| Email capture + enquiry submission | 🔌 | `submitLead` / `submitEnquiry` log to console |

---

## 3. Recent decisions (newest first)

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

1. **Admin product CRUD** — wire `/admin/products` so admins can edit name/price/flags (`isDiscount`, `isNewArrival`, `isFastMoving`) and trigger the homepage carousel from real data.
2. **Enquiries inbox** — convert to a real list+filter view backed by `api.getEnquiries` once `POST /api/v1/enquiries` is live in Spring Boot.
3. **Spring Boot backend kickoff** — hand `backendSpec.md` to the Java team; first vertical slice should be auth + blogs (smallest schema, already proven shape).
4. **Cloudinary integration** — once backend image-upload endpoint exists, replace the URL-paste field in `BlogEditor.tsx` with the upload→URL response.
5. **Analytics dashboard** — replace the coming-soon panel with real product-click + enquiry charts.
6. **AI-generated blog drafts** — feature-flagged option in the blog editor that calls the Java backend's AI endpoint.

---

## 5. Known gaps / debt

- Admin auth is mock-only; do **not** ship publicly until JWT auth is wired.
- Blog `localStorage` store is per-browser — drafts created on one machine won't appear on another. Acceptable for demo, must die when backend lands.
- Product data lives in `src/data/products.ts`; admin product page has no real persistence yet.
- No automated tests yet. Add Vitest + Playwright after the Spring Boot backend stabilises.
- `src/routeTree.gen.ts` is auto-generated by the TanStack Router Vite plugin — never edit by hand.
