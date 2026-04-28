# Moments Packaging — Frontend

Marketing + commerce frontend for **Moments Packaging Kenya** — a Nairobi-based
packaging supplier serving SMEs, corporates and event organisers across Kenya.

The app is the public storefront, the persona-aware product browser, the
enquiry funnel, the blog, **and** the staff/admin dashboard — all in one
TanStack Start app, ready to plug into a Java Spring Boot backend.

> 📄 Companion docs:
> - [`backendSpec.md`](./backendSpec.md) — **paste-ready** Spring Boot build brief (20 sections: stack, package layout, full Flyway SQL, every endpoint + DTO, role matrix, search algorithm, security checklist, tests, Docker/CI, acceptance criteria). Designed so an autonomous coding agent can build the backend end-to-end without follow-up questions.
> - [`progress.md`](./progress.md) — living status tracker; update at the end of every session

---

## 1. Tech stack

| Layer | Choice |
| --- | --- |
| Framework | **TanStack Start v1** (React 19 + Vite 7, file-based routing, SSR-ready) |
| Routing | `@tanstack/react-router` (auto-generated `routeTree.gen.ts` — **never edit by hand**) |
| Styling | **Tailwind CSS v4** via `src/styles.css` (native `@import` + `@theme`, `oklch` tokens) |
| UI primitives | shadcn/ui (Radix under the hood) — see `src/components/ui/` |
| Animation | `framer-motion` |
| Icons | `lucide-react` |
| State | React context (`PersonaContext`, `BasketContext`, `AdminAuthContext`) |
| Data layer | `src/services/api.ts` — single typed façade; prefers Spring Boot, mock data is opt-in only |
| Build target | Edge runtime (Cloudflare Workers via Wrangler) |

---

## 2. Getting started

```bash
# install (lockfile is bun)
bun install
# or: npm install / pnpm install

# dev server
bun dev

# typecheck
npx tsc --noEmit

# production build
bun run build
```

Environment variables go in `.env.local` (see `.env.example`):

```
VITE_API_URL=https://api.momentspackaging.com   # Spring Boot base URL once live
VITE_USE_MOCK_DATA=false                        # true only for offline demos
```

For local backend testing, use `VITE_API_URL=http://localhost:8080` and keep
`VITE_USE_MOCK_DATA=false` so catalogue/admin data comes from Spring Boot.

---

## 3. Project layout

```
src/
  routes/                 ← file-based routes (TanStack)
    __root.tsx            ← html/head/body shell, providers, global error/404
    index.tsx             ← landing page
    products.tsx          ← /products listing
    products.$slug.tsx    ← /products/:slug detail
    blog.index.tsx        ← /blog listing + template filters
    blog.$slug.tsx        ← /blog/:slug detail + suggested next read
    _adminAuth.tsx        ← layout guard for everything under /admin
    _adminAuth.admin.*.tsx← admin sub-routes (blogs, products, enquiries, …)
    admin.login.tsx       ← public admin login

  components/
    SiteLayout.tsx        ← header + footer + floating UI orchestration
    SiteHeader.tsx        ← navbar (with logo)
    SiteFooter.tsx
    AppSplash.tsx         ← branded loading splash (navbar logo + shimmer)
    PageProgressBar.tsx   ← top-of-page navigation progress bar
    BasketPill.tsx        ← floating basket button (auto-lifts above email banner)
    BasketDrawer.tsx      ← basket sheet
    EmailCaptureBanner.tsx← bottom banner; reports visibility upward
    EmailInsiderPrompt.tsx← slide-in card; exit-intent + 50% scroll + 30s idle
    PersonaGate.tsx       ← "Are you SME / corporate / events?" gate + "Viewing as" pill
    PackagingCloud.tsx    ← animated category cloud on the landing page
    FeaturedCarousel.tsx  ← Deals / New / Fast-moving products row
    WhatsAppFloat.tsx
    Spinner.tsx
    ProductCardSkeleton.tsx
    ProductDetailSkeleton.tsx
    blog/
      BlogTemplates.tsx   ← 5 template renderers + BlogCard
      LatestBlogsStrip.tsx← homepage blog strip (1→5 cols, breakpoint-aware)
    admin/
      AdminProtectedRoute.tsx
      BlogEditor.tsx      ← template-aware form (5 templates)
      ComingSoon.tsx
    ui/                   ← shadcn primitives — leave alone unless replacing one

  contexts/
    AdminAuthContext.tsx  ← mock JWT auth for admin (replace once Spring Boot is live)
    BasketContext.tsx     ← persistent basket via localStorage
    PersonaContext.tsx    ← persona selection persistence

  data/
    products.ts           ← seed product catalogue (replaced by API later)
    blogs.ts              ← Blog model + seed posts + TEMPLATE_META

  services/
    api.ts                ← single source of truth for public backend calls
    blogStore.ts          ← localStorage-backed mock CRUD for blogs
    productStore.ts       ← admin product CRUD via Spring Boot, mock fallback optional
    search.ts             ← weighted ranking engine for SearchCommand

  lib/
    permissions.ts        ← single source of truth for ADMIN vs STAFF permissions (mirrored in backendSpec.md §2.1)
    utils.ts

  config/
    features.ts           ← BLOGS_ENABLED, EMAIL_CAPTURE_ENABLED feature flags

  layouts/
    AdminLayout.tsx       ← dark sidebar shell for /admin/*

  styles.css              ← Tailwind v4 theme + oklch design tokens + shimmer keyframes
  router.tsx              ← TanStack router bootstrap
  routeTree.gen.ts        ← AUTO-GENERATED — do not edit
```

---

## 4. Key architectural decisions

### 4.1 File-based routing (flat, dot-separated)

`src/routes/blog.$slug.tsx` → `/blog/:slug`. `_adminAuth.tsx` is a layout
guard — every `_adminAuth.admin.*.tsx` route renders inside its `<Outlet />`
and inherits the auth check.

### 4.2 Single API façade (`src/services/api.ts`)

Every component imports from one place. Each method is annotated with the
eventual endpoint:

```ts
// TODO: GET /api/v1/blogs/{slug}/related?limit=2
getRelatedBlogs: async (excludeSlug, limit = 2) => { … }
```

When the Spring Boot backend ships, swap each function body for `fetch` —
no component needs to change.

### 4.3 Design tokens, never raw colors

All colours, gradients and shadows live as `oklch` tokens in
[`src/styles.css`](./src/styles.css) and are exposed as Tailwind utilities
(`bg-accent`, `text-primary-foreground`, `border-border`, etc.). **Do not
write `bg-[#…]` or `text-white` in components** — themes break.

### 4.4 Floating-UI stack coordination

`SiteLayout` tracks whether the `EmailCaptureBanner` is visible and passes
`liftAbove` to `BasketPill` and the persona "Viewing as" pill so they never
overlap the banner. Add new floating UI by extending the same prop.

### 4.4.1 Email capture (two surfaces, one endpoint)

We deliberately layer **two** capture surfaces, both POSTing to
`api.submitLead(email, persona)`:

1. **`EmailCaptureBanner`** (bottom bar) — shown on page load, dismissible
   for 7 days. Storage key: `moments_email_banner`.
2. **`EmailInsiderPrompt`** (slide-in card, bottom-right) — proactive,
   insider-led copy ("be first to know about new arrivals, trends &
   exclusive goodies"). Triggers on the **first** of:
   - Exit intent (mouseleave at top of viewport, desktop only)
   - Scroll depth ≥ 50% of page
   - 30 seconds of idle (any user activity resets the timer)

   Shown at most **once per 3 days**, never again after submit, and fully
   suppressed if the bottom banner has already been submitted (reads the
   same `moments_email_banner` key) so we never double-prompt the same
   visitor. Storage key: `moments_insider_prompt`.

Backend mapping is in `backendSpec.md` §3.6 and §7 — the same `/leads`
endpoint accepts an optional `source` (`email_capture_banner` |
`insider_prompt`) and `trigger` (`exit_intent` | `scroll_50` | `idle_30s`)
so we can measure which capture path converts best.

### 4.5 Splash + page progress

Initial app load renders `AppSplash` (navbar-matching logo + themed shimmer).
Inter-route navigation shows `PageProgressBar` (3px gradient + shimmer).
Together they cover every loading moment.

### 4.6 Blog system (5 templates)

| Template | Use case |
| --- | --- |
| **Educative** | Plain-language explainer, intro + key points + conclusion |
| **Explanatory** | Problem → mechanism → takeaway (technical-light) |
| **Scenario** | "You run a juice bar in Westlands…" — believable Nairobi situations |
| **Storyline** | First-person narrative with chapters |
| **Announcement** | Short news/launch with optional CTA |

Each template stores its body as a discriminated union (`BlogBody`) so the
backend can persist it as a single JSONB column. The same shape drives the
admin form (`BlogEditor.tsx`) and the public renderer (`BlogTemplates.tsx`).

### 4.7 Admin auth (mock for now)

`AdminAuthContext` is a placeholder. **Do not ship admin routes publicly**
until the Spring Boot JWT flow described in `backendSpec.md` §2 is wired in.

### 4.8 Role-based access control

Two roles exist: **ADMIN** and **STAFF**. The full permission matrix lives in
[`src/lib/permissions.ts`](./src/lib/permissions.ts) and is the **single source
of truth** — `AdminLayout` (sidebar), route layouts (`<Forbidden />` gate),
and individual buttons (delete actions) all call `can(role, permission)` from
the same file.

| | ADMIN | STAFF |
| --- | --- | --- |
| Blogs create / edit | ✅ | ✅ |
| Blogs delete | ✅ | ❌ |
| Products create / edit | ✅ | ✅ |
| Products delete | ✅ | ❌ |
| Enquiries view / update | ✅ | ✅ |
| `/admin/staff` | ✅ | ❌ (Forbidden) |
| `/admin/settings` | ✅ | ❌ (Forbidden) |

The Spring Boot backend **must re-check every permission server-side** using
the same matrix — UI guards are convenience only. See `backendSpec.md` §2.1.

---

## 5. Working with this codebase

### 5.1 Adding a route

1. Create `src/routes/my-page.tsx` with `createFileRoute("/my-page")`.
2. Always include a `head()` block with unique `title`, `description`,
   `og:title`, `og:description` (and `og:image` if a hero image exists).
3. The Vite plugin regenerates `routeTree.gen.ts` automatically.

### 5.2 Adding an API call

1. Add the method to `src/services/api.ts` with a `// TODO: <METHOD> /api/v1/…`
   comment matching `backendSpec.md`.
2. Return mock data of the correct shape for now.
3. Update `backendSpec.md` if the endpoint isn't documented yet.

### 5.3 Adding a feature flag

Edit `src/config/features.ts`. Read it at the top of any route or component
that conditionally renders.

### 5.4 Updating progress

After every meaningful change, edit `progress.md`:
- Tick the right row in the feature matrix.
- Add a one-liner under "Recent decisions" with today's date.
- Re-prioritise "Next up" if scope shifted.

---

## 6. Deployment

The app deploys to Cloudflare Workers via `wrangler.jsonc`. Two stable URLs:

- **Production:** `https://www.momentspackaging.com` / `https://momentspackaging.com`
- **Preview:** `https://moments-connect-hub.lovable.app`

Edge-runtime constraints apply — see the "Server Runtime" notes in the
TanStack docs before adding heavy Node-only dependencies.

---

## 7. Documentation index

| File | Purpose |
| --- | --- |
| `README.md` (this file) | Architecture, layout, conventions |
| `backendSpec.md` | Java Spring Boot API contract |
| `progress.md` | Living progress tracker |

Keep the three in sync. Future-you (and the next AI agent) will thank you.
