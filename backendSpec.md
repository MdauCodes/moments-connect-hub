# Moments Packaging — Spring Boot Backend Contract

This document is the source of truth for the Java/Spring Boot backend that
powers the Moments Packaging Kenya website. The frontend is already built
against these shapes — keep field names, status codes and validation rules
identical to avoid breaking the React client.

> **Convention:** All endpoints are versioned under `/api/v1`. JSON only,
> UTF-8, ISO-8601 timestamps in UTC. Pagination via `?page=&size=` (default
> `page=0`, `size=20`).

---

## 1. Stack & infrastructure

| Concern | Choice |
| --- | --- |
| Language | Java 21 |
| Framework | Spring Boot 3.3+ |
| Build | Maven or Gradle |
| Database | PostgreSQL 15+ |
| Migrations | Flyway (`db/migration/V__*.sql`) |
| Auth | Spring Security + JWT (HS256, 15-min access, 7-day refresh) |
| File storage | S3-compatible bucket (AWS S3, DigitalOcean Spaces, or Cloudflare R2) |
| Email | SMTP via Spring Mail (transactional) |
| Validation | `jakarta.validation` (`@NotBlank`, `@Size`, `@Email`, etc.) |
| Logging | SLF4J + structured JSON (Logstash encoder) |
| API docs | springdoc-openapi (`/swagger-ui.html`) |
| CORS | Allow `https://www.momentspackaging.com`, `https://momentspackaging.com`, and the staging preview URL |

---

## 2. Authentication & authorization

### 2.1 Roles
```
ROLE_ADMIN  — full access to everything
ROLE_STAFF  — manage products, blogs, enquiries; cannot touch staff/settings
```

Roles are stored in a separate `user_roles` join table — never on the user
row itself — and resolved via a `@Service` method that the JWT filter calls
once per request.

### 2.2 Auth endpoints

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/login` | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| POST | `/api/v1/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| POST | `/api/v1/auth/logout` | — (uses bearer) | `204 No Content` |
| GET | `/api/v1/auth/me` | — | `{ user }` |

**JWT claims:**
```json
{ "sub": "<userId>", "email": "...", "roles": ["ROLE_ADMIN"], "iat": ..., "exp": ... }
```

### 2.3 Public vs protected
- `GET` requests under `/api/v1/public/**` require **no auth**: products,
  industries, blogs (published only), config.
- All other admin endpoints require a bearer token with the matching role.
- Webhooks (e.g. payment callbacks) live under `/api/v1/public/webhooks/**`
  and verify a shared HMAC signature in the `X-Signature` header.

### 2.4 Validation rules (always)
- Trim every string before validating.
- Enforce min/max lengths.
- Reject unknown enum values (`@JsonProperty` + custom deserializer or
  `@Pattern`).
- Cap arrays (e.g. `tags` ≤ 10).
- Use `@SafeHtml` (Jsoup) on any rich text fields if you accept HTML.

---

## 3. Domain entities

All tables use `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` and
`created_at`, `updated_at` timestamps with a Flyway-managed
`update_timestamp()` trigger.

### 3.1 Users (`users`)
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| email | TEXT UNIQUE NOT NULL | Lowercase, trimmed |
| name | TEXT NOT NULL | |
| password_hash | TEXT NOT NULL | BCrypt (cost ≥ 12) |
| status | TEXT NOT NULL | `active` / `disabled` |
| created_at, updated_at | TIMESTAMPTZ | |

### 3.2 User roles (`user_roles`)
| Column | Type |
| --- | --- |
| user_id | UUID FK users(id) ON DELETE CASCADE |
| role | TEXT (`ROLE_ADMIN` / `ROLE_STAFF`) |
| PRIMARY KEY (user_id, role) | |

### 3.3 Industries (`industries`)
| Column | Type |
| --- | --- |
| id | UUID PK |
| name | TEXT NOT NULL |
| slug | TEXT UNIQUE NOT NULL |
| icon | TEXT (emoji shown in chips/lists) |
| description | TEXT |
| tagline | TEXT (short marketing line shown on `/industries` cards) |
| keywords | TEXT[] (synonyms / colloquialisms used by search recall) |

**Canonical seed data — keep slugs and IDs stable, the React app references
them as the source of truth (see `src/data/products.ts`):**

| id | name | slug | icon |
| --- | --- | --- | --- |
| 1 | Food & Beverage | `food-beverage` | 🍔 |
| 2 | Agriculture | `agriculture` | 🌾 |
| 3 | Textile & Apparel | `textile-apparel` | 🧵 |
| 4 | E-commerce & Mailers | `ecommerce-mailers` | 📦 |
| 5 | Gifting & Events | `gifting-events` | 🎁 |
| 6 | Beauty & Personal Care | `beauty-personal-care` | 💄 |
| 7 | Pharma & Health | `pharma-health` | 💊 |
| 8 | Industrial & Hardware | `industrial-hardware` | 🛠️ |

### 3.4 Products (`products`)
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| slug | TEXT UNIQUE NOT NULL | |
| name | TEXT NOT NULL | ≤ 120 chars |
| category | TEXT NOT NULL | `bags` / `cups` / `boxes` / `mailers` / `labels` / `gifting` |
| description | TEXT | |
| moq | INT NOT NULL | ≥ 1 |
| sizes | TEXT[] | |
| tags | TEXT[] | subset of `Trending`, `New`, `Discounted`, `Featured` |
| primary_image_url | TEXT NOT NULL | |
| image_urls | TEXT[] | |
| is_discount | BOOLEAN DEFAULT false | |
| discount_percent | INT | 1–90 when `is_discount = true` |
| is_new_arrival | BOOLEAN DEFAULT false | |
| is_fast_moving | BOOLEAN DEFAULT false | |
| material | TEXT | e.g. `Kraft 120gsm`, `PE-lined paper` (searchable) |
| finish | TEXT | e.g. `Matte`, `Gloss`, `Soft-touch` (searchable) |
| keywords | TEXT[] | free-form synonyms / sheng / common misspellings (boosts recall) |
| total_clicks, monthly_clicks | BIGINT DEFAULT 0 | |
| total_enquiries, monthly_enquiries | BIGINT DEFAULT 0 | |
| created_at, updated_at | TIMESTAMPTZ | |

Plus join table `product_industries(product_id, industry_id)`.

### 3.5 Enquiries (`enquiries`)
| Column | Type |
| --- | --- |
| id | UUID PK |
| reference | TEXT UNIQUE | e.g. `ENQ-2025-04-0001` |
| persona | TEXT | `individual` / `sme` / `corporate` |
| contact_name, contact_email, contact_phone, company | TEXT |
| message | TEXT |
| status | TEXT | `new` / `in_review` / `quoted` / `closed` |
| source | TEXT | `web_form` / `whatsapp` / `phone` |
| assigned_to | UUID NULL FK users(id) |
| created_at, updated_at | TIMESTAMPTZ |

Items: `enquiry_items(id, enquiry_id, product_id, qty, size, finish, notes)`.

### 3.6 Leads (`leads`)
| Column | Type |
| --- | --- |
| id | UUID PK |
| email | TEXT NOT NULL |
| persona | TEXT |
| source | TEXT | `email_capture_banner` / `footer` / etc. |
| created_at | TIMESTAMPTZ |

### 3.7 Product clicks (`product_clicks`)
| Column | Type |
| --- | --- |
| id | UUID PK |
| product_id | UUID FK |
| occurred_at | TIMESTAMPTZ DEFAULT now() |
| session_id | TEXT |

A scheduled job rolls these up into `products.total_clicks` and
`products.monthly_clicks` once per day at 00:30 EAT.

### 3.8 Blogs (`blogs`)
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| slug | TEXT UNIQUE NOT NULL | kebab-case, ≤ 80 chars |
| title | TEXT NOT NULL | ≤ 120 |
| excerpt | TEXT NOT NULL | ≤ 240 |
| template | TEXT NOT NULL | `educative` / `explanatory` / `scenario` / `storyline` / `announcement` |
| status | TEXT NOT NULL | `draft` / `published` |
| cover_image_url | TEXT NOT NULL | |
| cover_image_alt | TEXT NOT NULL | |
| cover_image_caption | TEXT | |
| secondary_image_url, secondary_image_alt, secondary_image_caption | TEXT | nullable |
| body | JSONB NOT NULL | template-specific shape (see §3.8.1) |
| author | TEXT NOT NULL | |
| tags | TEXT[] | |
| reading_time_min | INT NOT NULL | computed server-side from body word count |
| published_at | TIMESTAMPTZ | nullable while `status = 'draft'` |
| created_at, updated_at | TIMESTAMPTZ | |

Index `blogs_status_published_at_idx (status, published_at DESC)` for the
public listing.

#### 3.8.1 Blog body JSONB shapes

The `body` column always contains an object of shape
`{ "template": "<template>", "data": { ... } }`. The `data` object varies
per template — exactly mirroring the TypeScript types in `src/data/blogs.ts`:

```jsonc
// educative
{ "intro": "string", "keyPoints": [{"heading":"...", "body":"..."}], "conclusion": "string" }

// explanatory
{ "problem": "string", "mechanism": "string", "takeaway": "string" }

// scenario
{ "setup": "string", "challenge": "string", "resolution": "string", "callout": "string?" }

// storyline
{ "hook": "string", "chapters": [{"title":"...", "body":"..."}], "closing": "string" }

// announcement
{ "headline": "string", "body": "string", "ctaLabel": "string?", "ctaHref": "string?" }
```

Validate the JSON server-side with a `JsonSchemaValidator` bean (e.g.
networknt/json-schema-validator) keyed off the `template` value. Reject
payloads that don't match.

---

## 4. REST endpoints

Naming uses `kebab-case` for paths, `camelCase` for JSON fields. All list
endpoints support `?page=&size=&sort=` (Spring `Pageable`).

### 4.1 Public — `/api/v1/public`

| Method | Path | Returns |
| --- | --- | --- |
| GET | `/config` | `{ blogsEnabled, emailCaptureEnabled, whatsappNumber, companyEmail, companyPhone }` |
| GET | `/industries` | `Industry[]` |
| GET | `/products?industryId=&isDiscount=&isNewArrival=&isFastMoving=&category=` | `Page<Product>` |
| GET | `/products/recommended` | `Product[]` (top 4 by `monthly_clicks`) |
| GET | `/products/search?q=&limit=` | `Product[]` — ranked, see §6 |
| GET | `/products/{slug}` | `Product` (404 if missing) |
| POST | `/products/{id}/click` | `204` (records to `product_clicks`) |
| GET | `/blogs?status=published&template=&limit=` | `Blog[]` (status forced to `published`) |
| GET | `/blogs/latest?limit=3` | `Blog[]` |
| GET | `/blogs/{slug}` | `Blog` (only if `status = published`, else `404`) |
| POST | `/enquiries` | `{ id, reference }` (201) |
| POST | `/leads` | `{ id }` (201) |

### 4.2 Admin — `/api/v1/admin` (requires `ROLE_ADMIN` or `ROLE_STAFF`)

| Method | Path | Notes |
| --- | --- | --- |
| GET / POST | `/products` | List + create |
| PUT / DELETE | `/products/{id}` | |
| GET / PATCH | `/enquiries`, `/enquiries/{id}` | Status changes, assignment |
| GET / POST | `/blogs?status=&template=&q=` | List + create |
| GET / PUT / DELETE | `/blogs/{id}` | |
| POST | `/blogs/{id}/publish` | Sets `status='published'`, stamps `published_at` |
| POST | `/blogs/{id}/unpublish` | Sets `status='draft'`, clears `published_at` |
| POST | `/uploads/image` (multipart) | Returns `{ url, key }` after pushing to S3. Limit 5 MB, allowed types `image/jpeg`, `image/png`, `image/webp`. |

### 4.3 Admin (admin-only) — `/api/v1/admin/staff`, `/settings`
Restricted to `ROLE_ADMIN`.

---

## 5. Request / response shapes

The shapes match the TypeScript interfaces in `src/data/blogs.ts` and
`src/data/products.ts` — copy field names and casing exactly.

### 5.1 Create blog request

```http
POST /api/v1/admin/blogs
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "title": "Kraft vs Coated: Which Paper Bag Actually Fits Your Shop?",
  "slug": "kraft-vs-coated",            // optional — server slugifies title if omitted
  "excerpt": "A no-jargon comparison…",
  "template": "educative",
  "status": "draft",                     // or "published"
  "coverImage": {
    "url": "https://cdn.example.com/x.jpg",
    "alt": "Stack of branded kraft bags",
    "caption": null
  },
  "secondaryImage": null,
  "body": {
    "template": "educative",
    "data": {
      "intro": "...",
      "keyPoints": [{ "heading": "...", "body": "..." }],
      "conclusion": "..."
    }
  },
  "author": "Moments Team",
  "tags": ["bags", "kraft"]
}
```

**Validation:**
- `template` must equal `body.template`.
- `coverImage.url` must be a https URL on an allow-listed CDN host.
- `slug` (if supplied) matches `^[a-z0-9-]{1,80}$`.
- `tags` ≤ 10, each ≤ 32 chars, lowercased.
- If `status = "published"` and `publishedAt` not provided, server stamps `now()`.

**Response 201:** the full `Blog` object as defined in §3.8.

### 5.2 List blogs (public)

```http
GET /api/v1/public/blogs?status=published&limit=3
```

```json
[
  {
    "id": "…",
    "slug": "…",
    "title": "…",
    "excerpt": "…",
    "template": "educative",
    "status": "published",
    "coverImage": { "url": "…", "alt": "…", "caption": null },
    "secondaryImage": null,
    "body": { "template": "educative", "data": { ... } },
    "author": "Moments Team",
    "tags": ["bags"],
    "readingTimeMin": 4,
    "publishedAt": "2025-04-23T10:00:00Z",
    "createdAt": "2025-04-23T10:00:00Z",
    "updatedAt": "2025-04-23T10:00:00Z"
  }
]
```

### 5.3 Submit enquiry

```http
POST /api/v1/public/enquiries
Content-Type: application/json

{
  "persona": "sme",
  "contact": { "name": "…", "email": "…", "phone": "+254…", "company": "…" },
  "message": "…",
  "source": "web_form",
  "items": [
    { "productId": "…", "qty": 500, "size": "Medium", "finish": "Matte", "notes": "" }
  ]
}
```

Server-side: trigger an email to `sales@momentspackaging.co.ke` with the
formatted enquiry, persist with `status='new'`, return `{ id, reference }`.

---

## 6. Search ranking

`GET /api/v1/public/products/search?q=&limit=` is the single endpoint that
powers the global search overlay (`SearchCommand`) and the in-page filter on
`/products`. The frontend already implements the exact ranking algorithm
client-side in `src/services/search.ts` against the in-memory fixtures —
**mirror it on the backend** so swap-over is invisible.

### 6.1 Inputs
- `q` — required, trim, reject if length < 2 (return `[]`).
- `limit` — optional, default 12, max 50.

### 6.2 Weighted scoring (apply in order, sum the score)

| Rank | Signal | Field(s) | Weight |
| --- | --- | --- | --- |
| 1 | Name — exact (case-insensitive, trimmed) | `name` | 1000 |
| 1 | Name — starts-with | `name` | 600 |
| 1 | Name — contains phrase | `name` | 400 |
| 1 | Name — token match (per token) | `name` | 220 |
| 2 | Popularity (additive boost, capped) | `monthly_clicks` | `min(monthly_clicks / 50, 25)` |
| 3 | Industry — exact name match | joined `industries.name` | 180 |
| 3 | Industry — name contains | joined `industries.name` | 120 |
| 3 | Industry — keyword overlap | `industries.keywords[]` | 90 |
| 4 | Description — phrase contains | `description` | 80 |
| 4 | Description — token match (per token) | `description` | 35 |
| 5 | Category match | `category` | 60 |
| 5 | Tag match | `tags[]` | 50 |
| 5 | Material match | `material` | 45 |
| 5 | Finish match | `finish` | 30 |
| 5 | Size match | `sizes[]` | 25 |
| 5 | Custom keyword match | `keywords[]` | 70 |

Popularity is **additive only** and capped — it never overrides relevance,
it only breaks ties between similarly-scored products. Drop any product
whose total score is `0`. Sort `score DESC`, then `monthly_clicks DESC` as
the secondary tiebreaker, then `name ASC`.

### 6.3 Implementation hint (Postgres)

A `tsvector` column populated by trigger from
`name || ' ' || description || ' ' || array_to_string(keywords,' ') || …`
plus `ts_rank_cd` is the right baseline. Apply the weight table above as a
post-rank boost (e.g. add `100 * (lower(name) LIKE q || '%')::int`). Cache
the top 200 results per query in Redis for 60 seconds — the public catalogue
churn rate is low.

### 6.4 Frontend contract

The React client expects the same `Product` shape as `GET /products`. No
extra `score` field is needed; if you add one it must be ignored without
breaking JSON deserialisation (the frontend uses TypeScript `interface`,
not strict mode).

---

## 7. File storage

- Bucket `moments-uploads/<env>/<entity>/<uuid>.<ext>`.
- Generate signed PUT URLs for direct client-to-S3 upload, or accept
  multipart on `/uploads/image` and proxy to S3 (simpler, matches current
  admin flow which sends `FormData`).
- Always strip EXIF metadata server-side (e.g. with `metadata-extractor`).
- Return `https://cdn.momentspackaging.com/...` URLs that are CDN-fronted
  with at least `Cache-Control: public, max-age=31536000, immutable`.

---

## 7. Background jobs

| Job | Schedule | Purpose |
| --- | --- | --- |
| `RollUpProductClicksJob` | Daily 00:30 EAT | Aggregates `product_clicks` into `products.{total,monthly}_clicks`. |
| `ResetMonthlyCountersJob` | 1st of month 00:05 EAT | Zeros `monthly_clicks` and `monthly_enquiries`. |
| `LeadDigestEmailJob` | Weekdays 08:00 EAT | Sends the previous day's enquiries digest to the sales mailbox. |

Use Spring's `@Scheduled` with `@EnableScheduling` and a single-instance
lock (e.g. ShedLock) so jobs don't double-run when scaled horizontally.

---

## 8. Errors

All errors return:

```json
{
  "timestamp": "2025-04-23T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "code": "VALIDATION_FAILED",
  "message": "Human-readable summary",
  "fields": { "title": "must not be blank" }
}
```

Standard codes: `VALIDATION_FAILED` (400), `UNAUTHORIZED` (401),
`FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409),
`RATE_LIMITED` (429), `INTERNAL_ERROR` (500).

Apply `@ControllerAdvice` to translate `MethodArgumentNotValidException`,
`AccessDeniedException`, `EntityNotFoundException`, etc. into this shape.

---

## 9. Security checklist

- [ ] BCrypt passwords (cost ≥ 12), no SHA-anything.
- [ ] CSRF disabled for stateless JWT API; ensure SameSite cookies are not
      used for auth.
- [ ] Rate limit `POST /auth/login`, `/leads`, `/enquiries` (e.g. Bucket4j
      at 10 req/min/IP).
- [ ] Reject any `application/x-www-form-urlencoded` body on JSON endpoints.
- [ ] Log auth failures with IP + email; alert on > 20/min from one IP.
- [ ] All admin endpoints have `@PreAuthorize("hasRole('ADMIN')")` or
      `("hasAnyRole('ADMIN','STAFF')")` — never trust path prefixes alone.
- [ ] Seal `application.properties` secrets in a vault (Doppler, AWS
      Secrets Manager, Spring Cloud Config) — never in git.
- [ ] Run `mvn dependency-check:check` on every CI build.

---

## 10. Mapping to the React frontend

| Frontend file | Backend endpoint | Notes |
| --- | --- | --- |
| `src/services/api.ts` → `getConfig` | `GET /public/config` | Replace mock with `fetch` |
| `src/services/api.ts` → `getProducts` | `GET /public/products` | Pass query params straight through |
| `src/services/api.ts` → `getBlogs` | `GET /public/blogs` | |
| `src/services/api.ts` → `getBlogBySlug` | `GET /public/blogs/{slug}` | |
| `src/services/api.ts` → `getLatestBlogs` | `GET /public/blogs/latest?limit=3` | |
| `src/services/api.ts` → `submitEnquiry` | `POST /public/enquiries` | |
| `src/services/api.ts` → `submitLead` | `POST /public/leads` | |
| `src/services/api.ts` → `trackClick` | `POST /public/products/{id}/click` | Fire-and-forget; ignore response |
| `src/services/blogStore.ts` (CRUD) | `/admin/blogs/**` | The localStorage methods become real `fetch` calls; signatures stay the same so callers don't change |

When the backend is ready:
1. Replace `blogStore` internals with `fetch` against `/api/v1/admin/blogs`.
2. Drop the `import { blogStore }` re-export from `src/services/api.ts` and
   call `fetch` directly there too.
3. Flip `VITE_API_URL` in `.env` to point to the deployed backend.

The component layer doesn't change — that's the whole point of routing every
data access through `api.ts`.
