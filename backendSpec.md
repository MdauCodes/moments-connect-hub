# Moments Packaging — Spring Boot Backend Build Brief

> **Audience:** an autonomous coding agent (Claude Code, Cursor, etc.) tasked
> with building the Java/Spring Boot backend for the Moments Packaging Kenya
> website **end-to-end without follow-up questions**.
>
> **Source-of-truth rule:** the React frontend at `https://github.com/<repo>`
> is already shipped and **must not be touched**. Every shape, field name,
> casing convention, error code, and endpoint path in this document mirrors
> what the frontend already calls. Deviating breaks the client.
>
> **Definition of done:** the agent should be able to clone an empty repo,
> read this file, and produce a Spring Boot 3.3 service that:
> 1. Compiles with `./mvnw clean verify` (zero warnings, zero failing tests).
> 2. Boots locally against a Docker Postgres + LocalStack S3.
> 3. Passes the integration test suite described in §15.
> 4. Has every endpoint in §7 returning the exact JSON shapes in §8.
> 5. Honours the role matrix in §3 server-side (UI guards in the React app
>    are convenience only — the backend is the security boundary).
>
> If anything in this document is ambiguous, **default to what `src/services/api.ts`,
> `src/data/products.ts`, `src/data/blogs.ts`, and `src/lib/permissions.ts`
> in the frontend repo do** — they are authoritative.

---

## Table of contents

1. [Stack & infrastructure](#1-stack--infrastructure)
2. [Project bootstrap (pom.xml, package layout)](#2-project-bootstrap)
3. [Roles & permissions matrix](#3-roles--permissions-matrix)
4. [Authentication & JWT](#4-authentication--jwt)
5. [Configuration (application.yml + env vars)](#5-configuration)
6. [Database schema (Flyway migrations, full SQL)](#6-database-schema)
7. [REST endpoints (full table)](#7-rest-endpoints)
8. [Request / response DTO shapes](#8-request--response-dto-shapes)
9. [Search ranking (mirror of `src/services/search.ts`)](#9-search-ranking)
10. [Lead capture (two surfaces, one endpoint)](#10-lead-capture)
11. [File storage (S3 / R2)](#11-file-storage)
12. [Background jobs](#12-background-jobs)
13. [Errors & validation](#13-errors--validation)
14. [Security checklist](#14-security-checklist)
15. [Testing strategy](#15-testing-strategy)
16. [Observability & ops](#16-observability--ops)
17. [Docker, CI/CD, deployment](#17-docker-cicd-deployment)
18. [Mapping to the React frontend](#18-mapping-to-the-react-frontend)
19. [Acceptance criteria checklist](#19-acceptance-criteria-checklist)

---

## 1. Stack & infrastructure

| Concern | Choice | Why |
| --- | --- | --- |
| Language | **Java 21 (LTS)** | Pattern matching, records, virtual threads. |
| Framework | **Spring Boot 3.3.x** | Latest GA, Jakarta EE 10. |
| Build | **Maven** (wrapper committed) | Simpler for agents than Gradle Kotlin DSL. |
| Database | **PostgreSQL 15+** | `JSONB`, `tsvector`, `gen_random_uuid()`. |
| Migrations | **Flyway** (`db/migration/V__*.sql`) | Versioned, no Hibernate auto-DDL. |
| ORM | **Spring Data JPA + Hibernate 6.5** | With `hibernate-types` for JSONB. |
| Auth | **Spring Security 6 + jjwt 0.12** (HS256) | 15-min access, 7-day refresh. |
| Validation | **`jakarta.validation` (Hibernate Validator)** | `@NotBlank`, `@Size`, `@Email`, `@Pattern`. |
| File storage | **S3-compatible** (AWS S3 / DO Spaces / R2) via AWS SDK v2 | Signed PUT URLs **or** multipart proxy. |
| Email | **Spring Mail (SMTP)** + Thymeleaf templates | Sales digest + enquiry notifications. |
| Cache | **Caffeine** in-process (search results, config) | Redis only if horizontal scaling demands it. |
| Rate limiting | **Bucket4j** + Caffeine backend | Per-IP on `/auth/login`, `/leads`, `/enquiries`. |
| Logging | **SLF4J + Logback**, JSON encoder (`logstash-logback-encoder`) | Structured logs for ELK/Loki. |
| Metrics | **Micrometer + Prometheus** (`/actuator/prometheus`) | Latency, error rate, queue depth. |
| Tracing | **Micrometer Tracing → OTLP** (optional) | Disabled unless `OTEL_EXPORTER_OTLP_ENDPOINT` set. |
| API docs | **springdoc-openapi 2** (`/swagger-ui.html`) | Generated from controllers + DTOs. |
| Test | **JUnit 5 + Testcontainers (Postgres, LocalStack) + REST-assured** | Integration tests against a real DB. |
| CORS | Allow `https://www.momentspackaging.com`, `https://momentspackaging.com`, `https://moments-connect-hub.lovable.app`, and any `http://localhost:*` in `dev` profile only. | |

**Convention:** All endpoints are versioned under `/api/v1`. JSON only,
UTF-8, **camelCase JSON fields**, ISO-8601 timestamps in UTC. Pagination via
`?page=&size=&sort=` (Spring `Pageable`, default `page=0`, `size=20`,
`max size=100`).

---

## 2. Project bootstrap

### 2.1 Maven coordinates

`pom.xml` essentials (the agent should generate the full file):

```xml
<groupId>ke.co.momentspackaging</groupId>
<artifactId>moments-backend</artifactId>
<version>0.1.0</version>
<packaging>jar</packaging>

<properties>
  <java.version>21</java.version>
  <spring-boot.version>3.3.4</spring-boot.version>
  <jjwt.version>0.12.6</jjwt.version>
  <hibernate-types.version>3.7.7</hibernate-types.version>
  <bucket4j.version>8.10.1</bucket4j.version>
  <testcontainers.version>1.20.2</testcontainers.version>
  <springdoc.version>2.6.0</springdoc.version>
  <logstash-encoder.version>8.0</logstash-encoder.version>
</properties>
```

**Required dependencies** (group:artifact):
- `org.springframework.boot:spring-boot-starter-web`
- `org.springframework.boot:spring-boot-starter-data-jpa`
- `org.springframework.boot:spring-boot-starter-security`
- `org.springframework.boot:spring-boot-starter-validation`
- `org.springframework.boot:spring-boot-starter-mail`
- `org.springframework.boot:spring-boot-starter-actuator`
- `org.springframework.boot:spring-boot-starter-cache`
- `org.flywaydb:flyway-core`, `org.flywaydb:flyway-database-postgresql`
- `org.postgresql:postgresql`
- `io.hypersistence:hypersistence-utils-hibernate-63` (JSONB mapping)
- `io.jsonwebtoken:jjwt-api`, `jjwt-impl` (runtime), `jjwt-jackson` (runtime)
- `com.bucket4j:bucket4j-core`, `bucket4j-caffeine`
- `com.github.ben-manes.caffeine:caffeine`
- `software.amazon.awssdk:s3` (2.x), `software.amazon.awssdk:s3-transfer-manager`
- `net.logstash.logback:logstash-logback-encoder`
- `io.micrometer:micrometer-registry-prometheus`
- `org.springdoc:springdoc-openapi-starter-webmvc-ui`
- `com.networknt:json-schema-validator` (blog body JSONB validation)
- `net.javacrumbs.shedlock:shedlock-spring`, `shedlock-provider-jdbc-template`

**Test dependencies:**
- `org.springframework.boot:spring-boot-starter-test`
- `org.springframework.security:spring-security-test`
- `org.testcontainers:postgresql`, `org.testcontainers:localstack`, `org.testcontainers:junit-jupiter`
- `io.rest-assured:rest-assured`

### 2.2 Package layout (mandatory)

```
ke.co.momentspackaging
├── MomentsBackendApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── JwtAuthFilter.java
│   ├── JwtService.java
│   ├── CorsConfig.java
│   ├── OpenApiConfig.java
│   ├── CacheConfig.java
│   ├── RateLimitConfig.java
│   ├── S3Config.java
│   └── SchedulerConfig.java
├── auth/
│   ├── AuthController.java
│   ├── AuthService.java
│   ├── dto/{LoginRequest, LoginResponse, RefreshRequest, MeResponse}.java
│   └── exception/InvalidCredentialsException.java
├── user/
│   ├── User.java                ← @Entity
│   ├── UserRole.java            ← @Entity (composite PK)
│   ├── Role.java                ← enum { ROLE_ADMIN, ROLE_STAFF }
│   ├── UserRepository.java
│   ├── UserRoleRepository.java
│   ├── UserService.java
│   └── dto/UserDto.java
├── industry/
│   ├── Industry.java
│   ├── IndustryRepository.java
│   ├── IndustryController.java   ← public read-only
│   ├── IndustryService.java
│   └── dto/IndustryDto.java
├── product/
│   ├── Product.java
│   ├── ProductIndustry.java     ← join entity (or @ManyToMany)
│   ├── ProductClick.java
│   ├── ProductRepository.java
│   ├── ProductClickRepository.java
│   ├── PublicProductController.java
│   ├── AdminProductController.java
│   ├── ProductService.java
│   ├── ProductSearchService.java ← §9
│   └── dto/{ProductDto, ProductCreateRequest, ProductUpdateRequest, ProductSearchHit}.java
├── blog/
│   ├── Blog.java
│   ├── BlogRepository.java
│   ├── PublicBlogController.java
│   ├── AdminBlogController.java
│   ├── BlogService.java
│   ├── BlogBodyValidator.java   ← JSON schema per template
│   └── dto/{BlogDto, BlogCreateRequest, BlogUpdateRequest, BlogImageDto}.java
├── enquiry/
│   ├── Enquiry.java
│   ├── EnquiryItem.java
│   ├── EnquiryStatus.java       ← enum
│   ├── EnquiryRepository.java
│   ├── PublicEnquiryController.java
│   ├── AdminEnquiryController.java
│   ├── EnquiryService.java
│   ├── EnquiryReferenceGenerator.java
│   └── dto/{EnquiryDto, EnquiryCreateRequest, EnquiryStatusUpdateRequest, EnquiryItemDto}.java
├── lead/
│   ├── Lead.java
│   ├── LeadRepository.java
│   ├── PublicLeadController.java
│   ├── LeadService.java
│   └── dto/{LeadCreateRequest, LeadDto}.java
├── upload/
│   ├── UploadController.java    ← admin multipart proxy to S3
│   ├── UploadService.java
│   └── dto/UploadResponse.java
├── config_endpoint/
│   ├── PublicConfigController.java
│   └── dto/PublicConfigDto.java
├── jobs/
│   ├── RollUpProductClicksJob.java
│   ├── ResetMonthlyCountersJob.java
│   └── LeadDigestEmailJob.java
├── email/
│   ├── EmailService.java
│   └── templates/   ← Thymeleaf .html
├── common/
│   ├── ApiError.java
│   ├── GlobalExceptionHandler.java
│   ├── PageResponse.java
│   ├── SlugUtil.java
│   ├── ReadingTimeCalculator.java
│   └── BaseEntity.java          ← @MappedSuperclass with id/createdAt/updatedAt
└── security/
    ├── PermissionEvaluatorImpl.java
    └── annotations/{IsAdmin, IsStaffOrAdmin}.java   ← meta-annotations wrapping @PreAuthorize
```

`src/main/resources/`:
```
application.yml
application-dev.yml
application-prod.yml
db/migration/V001__initial_schema.sql
db/migration/V002__seed_industries.sql
db/migration/V003__product_search_tsvector.sql
templates/email/enquiry-received.html
templates/email/lead-digest.html
schema/blog-body/{educative,explanatory,scenario,storyline,announcement}.json
```

---

## 3. Roles & permissions matrix

**This is the source of truth — mirror it byte-for-byte from
`src/lib/permissions.ts`.** UI guards in the React app are convenience only;
the backend MUST re-check every permission server-side.

### 3.1 Roles (enum `Role`)

```
ROLE_ADMIN  — full access to everything
ROLE_STAFF  — operational: blogs+products+enquiries CRUD, no delete,
              cannot reach /admin/staff or /admin/settings
```

Roles are stored in a separate `user_roles` join table, **never** on the user
row itself, and resolved into `GrantedAuthority` instances by the JWT filter
on every request.

### 3.2 Permission matrix (enforce server-side via `@PreAuthorize`)

| Permission | Admin endpoint(s) | ADMIN | STAFF |
| --- | --- | :---: | :---: |
| `blog:create` | `POST /admin/blogs` | ✅ | ✅ |
| `blog:edit`   | `PUT /admin/blogs/{id}`, `POST /admin/blogs/{id}/publish`, `/unpublish` | ✅ | ✅ |
| `blog:delete` | `DELETE /admin/blogs/{id}` | ✅ | ❌ |
| `product:create` | `POST /admin/products` | ✅ | ✅ |
| `product:edit`   | `PUT /admin/products/{id}` | ✅ | ✅ |
| `product:delete` | `DELETE /admin/products/{id}` | ✅ | ❌ |
| `enquiry:view`   | `GET /admin/enquiries`, `GET /admin/enquiries/{id}` | ✅ | ✅ |
| `enquiry:update` | `PATCH /admin/enquiries/{id}` (status, assignee, notes) | ✅ | ✅ |
| `staff:manage`   | `* /admin/users/**` | ✅ | ❌ (403) |
| `settings:manage`| `* /admin/settings/**` | ✅ | ❌ (403) |

### 3.3 How to enforce

Use Spring Security `@EnableMethodSecurity(prePostEnabled = true)` and the
custom meta-annotations:

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("hasRole('ADMIN')")
public @interface IsAdmin {}

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("hasAnyRole('ADMIN','STAFF')")
public @interface IsStaffOrAdmin {}
```

Apply at the controller method level — never trust path prefixes alone:

```java
@DeleteMapping("/products/{id}")
@IsAdmin                                   // STAFF gets 403
public void delete(@PathVariable UUID id) { … }

@PostMapping("/products")
@IsStaffOrAdmin                            // STAFF allowed to create
public ProductDto create(@RequestBody @Valid ProductCreateRequest body) { … }
```

---

## 4. Authentication & JWT

### 4.1 Endpoints (no auth required for `/login` and `/refresh`)

| Method | Path | Body | 200 Response | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/auth/login` | `{ email, password }` | `{ accessToken, refreshToken, user }` | Rate-limited 10 req/min/IP. |
| POST | `/api/v1/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` | Rotates both tokens. |
| POST | `/api/v1/auth/logout` | — (Bearer) | `204` | Revokes the refresh token (store hash in `revoked_tokens` table). |
| GET  | `/api/v1/auth/me` | — (Bearer) | `{ user }` | |

### 4.2 JWT format (HS256)

Access token (15 min), refresh token (7 days):

```json
{
  "sub": "<userId-uuid>",
  "email": "admin@momentspackaging.co.ke",
  "name": "Director",
  "roles": ["ROLE_ADMIN"],
  "type": "access",          // or "refresh"
  "iat": 1714000000,
  "exp": 1714000900,
  "jti": "<uuid>"
}
```

- Sign with `JWT_SECRET` (≥ 256-bit, base64-encoded, from env / vault).
- On every request, `JwtAuthFilter` parses `Authorization: Bearer …`,
  validates signature + expiry + `type=access`, loads roles from the JWT
  claims (do NOT hit DB on every request — refresh roles only on token
  rotation).
- On refresh, look up the refresh token's `jti` in `refresh_tokens`; mark
  old `jti` revoked, issue new pair (rotation).
- On logout, mark `jti` revoked.

### 4.3 Public vs protected paths

```java
http
  .authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/v1/public/**", "/api/v1/auth/login",
                     "/api/v1/auth/refresh",
                     "/swagger-ui/**", "/v3/api-docs/**",
                     "/actuator/health", "/actuator/prometheus").permitAll()
    .requestMatchers("/api/v1/admin/users/**", "/api/v1/admin/settings/**")
        .hasRole("ADMIN")
    .requestMatchers("/api/v1/admin/**").hasAnyRole("ADMIN", "STAFF")
    .anyRequest().authenticated())
  .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
  .csrf(AbstractHttpConfigurer::disable)
  .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
```

### 4.4 Validation rules (always apply)

- Trim every string before validating.
- Enforce min/max lengths on every `@Size`.
- Reject unknown enum values via `@JsonProperty` + custom deserializer or `@Pattern`.
- Cap arrays (e.g. `tags ≤ 10`).
- Reject `application/x-www-form-urlencoded` on JSON endpoints.
- Use `@SafeHtml` (Jsoup) on any rich-text fields if HTML is accepted.

---

## 5. Configuration

### 5.1 `application.yml` (default profile = `prod`)

```yaml
spring:
  application:
    name: moments-backend
  datasource:
    url: ${DB_URL}
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 10000
  jpa:
    hibernate:
      ddl-auto: validate          # NEVER 'update' or 'create' — Flyway owns the schema
    properties:
      hibernate.jdbc.time_zone: UTC
      hibernate.default_batch_fetch_size: 32
  flyway:
    enabled: true
    baseline-on-migrate: true
  mail:
    host: ${SMTP_HOST}
    port: ${SMTP_PORT:587}
    username: ${SMTP_USER}
    password: ${SMTP_PASSWORD}
    properties.mail.smtp.starttls.enable: true
  jackson:
    default-property-inclusion: non_null
    serialization.write-dates-as-timestamps: false

server:
  port: 8080
  forward-headers-strategy: framework
  compression.enabled: true
  http2.enabled: true
  error.include-message: never     # never leak stack traces

app:
  jwt:
    secret: ${JWT_SECRET}
    access-ttl: PT15M
    refresh-ttl: P7D
  cors:
    allowed-origins:
      - https://www.momentspackaging.com
      - https://momentspackaging.com
      - https://moments-connect-hub.lovable.app
  s3:
    bucket: ${S3_BUCKET:moments-uploads}
    region: ${S3_REGION:eu-west-1}
    endpoint: ${S3_ENDPOINT:}     # set for R2/Spaces; blank uses AWS
    public-base-url: ${CDN_BASE_URL:https://cdn.momentspackaging.com}
    max-bytes: 5242880            # 5 MB
    allowed-types: image/jpeg,image/png,image/webp
  rate-limit:
    login-per-minute: 10
    leads-per-minute: 20
    enquiries-per-minute: 10
  email:
    sales-inbox: sales@momentspackaging.co.ke
  whatsapp-number: "254700000000"
  company-email: sales@momentspackaging.co.ke
  company-phone: "+254 700 000 000"
  features:
    blogs-enabled: true
    email-capture-enabled: true

management:
  endpoints.web.exposure.include: health,info,metrics,prometheus
  endpoint.health.show-details: when_authorized
  metrics.tags.application: moments-backend

logging:
  level:
    root: INFO
    org.springframework.security: WARN
    ke.co.momentspackaging: INFO
```

### 5.2 Required environment variables

| Var | Example | Notes |
| --- | --- | --- |
| `DB_URL` | `jdbc:postgresql://db:5432/moments` | |
| `DB_USER`, `DB_PASSWORD` | | |
| `JWT_SECRET` | base64 256-bit | Rotate quarterly. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | | |
| `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | | |
| `CDN_BASE_URL` | `https://cdn.momentspackaging.com` | |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | optional | |

Secrets MUST come from env / vault — never committed.

---

## 6. Database schema

All migrations are idempotent SQL in `db/migration/`. Hibernate `ddl-auto`
is **`validate`** — it must never write to the schema.

### 6.1 V001__initial_schema.sql (paste verbatim)

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;     -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pg_trgm;      -- trigram fallback for search
CREATE EXTENSION IF NOT EXISTS unaccent;     -- accent-insensitive search

-- Updated-at trigger reused everywhere
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$ LANGUAGE plpgsql;

-- ---------- USERS & ROLES ----------
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         CITEXT UNIQUE NOT NULL,                -- enable citext extension first if needed
  name          TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  password_hash TEXT NOT NULL,                          -- BCrypt cost ≥ 12
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role    TEXT NOT NULL CHECK (role IN ('ROLE_ADMIN','ROLE_STAFF')),
  PRIMARY KEY (user_id, role)
);

CREATE TABLE refresh_tokens (
  jti        UUID PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX refresh_tokens_user_idx ON refresh_tokens(user_id);

-- ---------- INDUSTRIES ----------
CREATE TABLE industries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id  INT UNIQUE NOT NULL,                     -- 1..8 stable IDs the React app uses
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  icon_key    TEXT NOT NULL,                            -- frontend maps to lucide-react icon
  description TEXT,
  tagline     TEXT,
  keywords    TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER industries_updated_at BEFORE UPDATE ON industries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------- PRODUCTS ----------
CREATE TABLE products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  name                TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  category            TEXT NOT NULL CHECK (category IN ('bags','cups','boxes','mailers','labels','gifting')),
  description         TEXT,
  moq                 INT NOT NULL CHECK (moq >= 1),
  sizes               TEXT[] NOT NULL DEFAULT '{}',
  tags                TEXT[] NOT NULL DEFAULT '{}',
  primary_image_url   TEXT NOT NULL,
  image_urls          TEXT[] NOT NULL DEFAULT '{}',
  is_discount         BOOLEAN NOT NULL DEFAULT false,
  discount_percent    INT CHECK (discount_percent IS NULL OR discount_percent BETWEEN 1 AND 90),
  is_new_arrival      BOOLEAN NOT NULL DEFAULT false,
  is_fast_moving      BOOLEAN NOT NULL DEFAULT false,
  material            TEXT,
  finish              TEXT,
  keywords            TEXT[] NOT NULL DEFAULT '{}',
  total_clicks        BIGINT NOT NULL DEFAULT 0,
  monthly_clicks      BIGINT NOT NULL DEFAULT 0,
  total_enquiries     BIGINT NOT NULL DEFAULT 0,
  monthly_enquiries   BIGINT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT discount_percent_required
    CHECK ((is_discount = false) OR (discount_percent IS NOT NULL))
);
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX products_category_idx       ON products(category);
CREATE INDEX products_is_discount_idx    ON products(is_discount) WHERE is_discount;
CREATE INDEX products_is_new_arrival_idx ON products(is_new_arrival) WHERE is_new_arrival;
CREATE INDEX products_is_fast_moving_idx ON products(is_fast_moving) WHERE is_fast_moving;
CREATE INDEX products_monthly_clicks_idx ON products(monthly_clicks DESC);

CREATE TABLE product_industries (
  product_id  UUID NOT NULL REFERENCES products(id)   ON DELETE CASCADE,
  industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE RESTRICT,
  PRIMARY KEY (product_id, industry_id)
);
CREATE INDEX product_industries_industry_idx ON product_industries(industry_id);

CREATE TABLE product_clicks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id  TEXT
);
CREATE INDEX product_clicks_product_idx     ON product_clicks(product_id);
CREATE INDEX product_clicks_occurred_at_idx ON product_clicks(occurred_at);

-- ---------- ENQUIRIES ----------
CREATE TABLE enquiries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference     TEXT UNIQUE NOT NULL,                  -- ENQ-YYYY-MM-####
  persona       TEXT NOT NULL CHECK (persona IN ('individual','sme','corporate')),
  contact_name  TEXT NOT NULL CHECK (char_length(contact_name) BETWEEN 1 AND 120),
  contact_email CITEXT NOT NULL,
  contact_phone TEXT,
  company       TEXT,
  message       TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
  status        TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','in_review','quoted','closed')),
  source        TEXT NOT NULL CHECK (source IN ('web_form','whatsapp','phone')),
  assigned_to   UUID REFERENCES users(id) ON DELETE SET NULL,
  internal_notes TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER enquiries_updated_at BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX enquiries_status_idx     ON enquiries(status);
CREATE INDEX enquiries_created_at_idx ON enquiries(created_at DESC);

CREATE TABLE enquiry_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id  UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id)  ON DELETE RESTRICT,
  qty         INT NOT NULL CHECK (qty >= 1),
  size        TEXT,
  finish      TEXT,
  notes       TEXT
);
CREATE INDEX enquiry_items_enquiry_idx ON enquiry_items(enquiry_id);

-- ---------- LEADS ----------
CREATE TABLE leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       CITEXT UNIQUE NOT NULL,
  persona     TEXT NOT NULL DEFAULT 'unknown'
    CHECK (persona IN ('individual','sme','corporate','unknown')),
  source      TEXT NOT NULL
    CHECK (source IN ('email_capture_banner','insider_prompt','footer')),
  trigger_kind TEXT
    CHECK (trigger_kind IS NULL OR trigger_kind IN ('exit_intent','scroll_50','idle_30s')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- BLOGS ----------
CREATE TABLE blogs (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                     TEXT UNIQUE NOT NULL
    CHECK (slug ~ '^[a-z0-9-]{1,80}$'),
  title                    TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  excerpt                  TEXT NOT NULL CHECK (char_length(excerpt) BETWEEN 1 AND 240),
  template                 TEXT NOT NULL
    CHECK (template IN ('educative','explanatory','scenario','storyline','announcement')),
  status                   TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published')),
  cover_image_url          TEXT NOT NULL,
  cover_image_alt          TEXT NOT NULL,
  cover_image_caption      TEXT,
  secondary_image_url      TEXT,
  secondary_image_alt      TEXT,
  secondary_image_caption  TEXT,
  body                     JSONB NOT NULL,             -- shape per §8.4
  author                   TEXT NOT NULL DEFAULT 'Moments Packaging Director',
  tags                     TEXT[] NOT NULL DEFAULT '{}',
  reading_time_min         INT NOT NULL CHECK (reading_time_min >= 1),
  published_at             TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT published_at_required_when_published
    CHECK ((status = 'draft') OR (published_at IS NOT NULL))
);
CREATE TRIGGER blogs_updated_at BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX blogs_status_published_at_idx ON blogs(status, published_at DESC);
CREATE INDEX blogs_template_idx            ON blogs(template);

-- ---------- ShedLock (single-instance scheduled jobs) ----------
CREATE TABLE shedlock (
  name       VARCHAR(64) PRIMARY KEY,
  lock_until TIMESTAMPTZ NOT NULL,
  locked_at  TIMESTAMPTZ NOT NULL,
  locked_by  VARCHAR(255) NOT NULL
);
```

> If `CITEXT` is not available, use `TEXT` + a `LOWER(...)` unique index.

### 6.2 V002__seed_industries.sql

```sql
INSERT INTO industries (display_id, name, slug, icon_key, description, tagline, keywords) VALUES
 (1, 'Food & Beverage',         'food-beverage',         'UtensilsCrossed', 'Restaurants, cafés, cloud kitchens & takeaways.',     'From the first sip to the last bite.',         ARRAY['restaurant','cafe','coffee','takeaway','delivery','fnb','kitchen','bakery','juice','drinks']),
 (2, 'Agriculture',              'agriculture',           'Wheat',           'Farm produce, seeds, agro-processed goods & exports.', 'Field to shelf — packed to last.',             ARRAY['farm','agro','produce','seeds','grain','tea','coffee beans','horticulture','export']),
 (3, 'Textile & Apparel',        'textile-apparel',       'Shirt',           'Fashion brands, tailors, fabric & garment exporters.', 'Packaging your customers want to keep.',       ARRAY['fashion','clothing','garments','boutique','tailor','fabric','apparel']),
 (4, 'E-commerce & Mailers',     'ecommerce-mailers',     'Package',         'Online sellers, D2C brands & courier-ready packs.',    'Built for the unboxing reel.',                 ARRAY['online store','d2c','shipping','courier','instagram shop','tiktok shop','mailer']),
 (5, 'Gifting & Events',         'gifting-events',        'Gift',            'Hampers, weddings, corporate gifting & event décor.',  'Make every occasion feel like a gift.',        ARRAY['gift','hamper','wedding','event','corporate gift','party','celebration']),
 (6, 'Beauty & Personal Care',   'beauty-personal-care',  'Sparkles',        'Skincare, haircare, cosmetics & natural products.',    'Beauty starts before the bottle is opened.',   ARRAY['beauty','skincare','cosmetics','haircare','natural','organic','salon']),
 (7, 'Pharma & Health',          'pharma-health',         'Pill',            'Pharmacies, supplements, clinics & medical supplies.', 'Tamper-evident, compliant, trusted.',          ARRAY['pharmacy','medicine','supplement','clinic','health','medical']),
 (8, 'Industrial & Hardware',    'industrial-hardware',   'Wrench',          'Manufacturers, hardware shops & construction supply.', 'Heavy-duty packaging that earns its keep.',    ARRAY['industrial','hardware','manufacturing','construction','tools']);
```

### 6.3 V003__product_search_tsvector.sql

```sql
ALTER TABLE products ADD COLUMN search_vector tsvector;

CREATE OR REPLACE FUNCTION products_search_vector_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
      setweight(to_tsvector('simple', unaccent(coalesce(NEW.name,''))),         'A')
   || setweight(to_tsvector('simple', unaccent(array_to_string(NEW.keywords,' '))), 'B')
   || setweight(to_tsvector('simple', unaccent(array_to_string(NEW.tags,' '))),     'B')
   || setweight(to_tsvector('simple', unaccent(coalesce(NEW.material,''))),     'C')
   || setweight(to_tsvector('simple', unaccent(coalesce(NEW.finish,''))),       'C')
   || setweight(to_tsvector('simple', unaccent(array_to_string(NEW.sizes,' '))),'C')
   || setweight(to_tsvector('simple', unaccent(coalesce(NEW.description,''))),  'D');
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_vector_update
BEFORE INSERT OR UPDATE OF name, keywords, tags, material, finish, sizes, description
ON products FOR EACH ROW EXECUTE FUNCTION products_search_vector_trigger();

CREATE INDEX products_search_vector_idx ON products USING gin (search_vector);
CREATE INDEX products_name_trgm_idx     ON products USING gin (lower(name) gin_trgm_ops);
```

### 6.4 JPA mapping notes

- `BaseEntity`: `id (UUID)`, `createdAt`, `updatedAt` with `@PrePersist`/`@PreUpdate` as a fallback (DB triggers are authoritative).
- `Product.body` (Blog.body) is `@Type(JsonBinaryType.class) Map<String, Object>` from hypersistence-utils.
- `Product.industries` is `@ManyToMany` over `product_industries` (no extra entity needed).
- Use `@DynamicUpdate` on Product/Blog so partial PATCH updates don't rewrite long array columns.

---

## 7. REST endpoints

Naming: `kebab-case` paths, `camelCase` JSON. All list endpoints support
`?page=&size=&sort=` (Spring `Pageable`, `size` capped at 100).

### 7.1 Public — `/api/v1/public` (no auth)

| Method | Path | Returns | Notes |
| --- | --- | --- | --- |
| GET  | `/config` | `PublicConfigDto` | `{ blogsEnabled, emailCaptureEnabled, whatsappNumber, companyEmail, companyPhone }` — cached 60 s. |
| GET  | `/industries` | `IndustryDto[]` | Cached 5 min. |
| GET  | `/products?industryId=&isDiscount=&isNewArrival=&isFastMoving=&category=&page=&size=&sort=` | `Page<ProductDto>` | All filters AND-ed. |
| GET  | `/products/recommended` | `ProductDto[]` (top 4 by `monthly_clicks`) | Cached 60 s. |
| GET  | `/products/search?q=&limit=` | `ProductDto[]` | Ranked, see §9. `q` < 2 chars → `[]`. `limit` default 12, max 50. |
| GET  | `/products/{slug}` | `ProductDto` | 404 if missing. |
| POST | `/products/{id}/click` | `204` | Records to `product_clicks`. Fire-and-forget; rate-limit 60/min/IP. |
| GET  | `/blogs?status=published&template=&limit=` | `BlogDto[]` | Status forced to `published` regardless of input. |
| GET  | `/blogs/latest?limit=3` | `BlogDto[]` | Default 3, max 10. |
| GET  | `/blogs/{slug}` | `BlogDto` | Only if `status=published`, else 404. |
| GET  | `/blogs/{slug}/related?limit=2` | `BlogDto[]` | Random sample from other published blogs. |
| POST | `/enquiries` | 201 `{ id, reference }` | Rate-limited 10/min/IP. Triggers email to sales. |
| POST | `/leads` | 201 `{ id }` (or 200 if duplicate email) | Rate-limited 20/min/IP. Idempotent on email. |

### 7.2 Admin — `/api/v1/admin` (Bearer required)

| Method | Path | Required role | Notes |
| --- | --- | --- | --- |
| GET    | `/products?q=&category=&page=&size=&sort=` | STAFF or ADMIN | Returns drafts + active alike. |
| POST   | `/products` | STAFF or ADMIN | `ProductCreateRequest`. |
| GET    | `/products/{id}` | STAFF or ADMIN | |
| PUT    | `/products/{id}` | STAFF or ADMIN | Full replace. |
| DELETE | `/products/{id}` | **ADMIN only** | 204; cascades to `product_industries`, `product_clicks`. |
| GET    | `/blogs?status=&template=&q=&page=&size=` | STAFF or ADMIN | |
| POST   | `/blogs` | STAFF or ADMIN | `BlogCreateRequest`. |
| GET    | `/blogs/{id}` | STAFF or ADMIN | |
| PUT    | `/blogs/{id}` | STAFF or ADMIN | |
| DELETE | `/blogs/{id}` | **ADMIN only** | |
| POST   | `/blogs/{id}/publish` | STAFF or ADMIN | Sets `status='published'`, stamps `publishedAt`. |
| POST   | `/blogs/{id}/unpublish` | STAFF or ADMIN | Clears `publishedAt`. |
| GET    | `/enquiries?status=&assignedTo=&page=&size=` | STAFF or ADMIN | |
| GET    | `/enquiries/{id}` | STAFF or ADMIN | |
| PATCH  | `/enquiries/{id}` | STAFF or ADMIN | `{ status?, assignedTo?, internalNotes? }` — partial. |
| POST   | `/uploads/image` (multipart) | STAFF or ADMIN | Returns `{ url, key }`. Limit 5 MB; types JPEG/PNG/WebP. |
| GET    | `/users` | **ADMIN only** | List staff. |
| POST   | `/users` | **ADMIN only** | `{ email, name, password, roles[] }`. |
| PATCH  | `/users/{id}` | **ADMIN only** | Status / role changes. |
| DELETE | `/users/{id}` | **ADMIN only** | Soft-disable (set `status='disabled'`). |
| GET    | `/settings` | **ADMIN only** | `{ whatsappNumber, companyEmail, companyPhone, ... }`. |
| PUT    | `/settings` | **ADMIN only** | |

---

## 8. Request / response DTO shapes

**Field names and casing match the React TypeScript interfaces exactly.**
Copy them verbatim; do not introduce snake_case in JSON.

### 8.1 `ProductDto`

```json
{
  "id": "uuid",
  "slug": "string",
  "name": "string",
  "category": "bags|cups|boxes|mailers|labels|gifting",
  "description": "string|null",
  "moq": 100,
  "sizes": ["Small","Medium"],
  "tags": ["Trending"],
  "primaryImageUrl": "https://cdn…/x.jpg",
  "imageUrls": [],
  "isDiscount": false,
  "discountPercent": null,
  "isNewArrival": true,
  "isFastMoving": false,
  "material": "Kraft 120gsm",
  "finish": "Matte",
  "keywords": ["paper bag","kraft"],
  "industries": [
    { "id":"uuid","displayId":1,"name":"Food & Beverage","slug":"food-beverage","iconKey":"UtensilsCrossed" }
  ],
  "industryIds": ["uuid"],     // convenience for the React filter
  "monthlyClicks": 0,
  "totalClicks": 0,
  "createdAt": "2025-04-23T10:00:00Z",
  "updatedAt": "2025-04-23T10:00:00Z"
}
```

### 8.2 `ProductCreateRequest` / `ProductUpdateRequest`

```json
{
  "slug": "kraft-bag-medium",         // optional on create — server slugifies name
  "name": "Kraft Bag — Medium",
  "category": "bags",
  "description": "…",
  "moq": 100,
  "sizes": ["Small","Medium"],
  "tags": ["Trending"],
  "primaryImageUrl": "https://cdn…/x.jpg",
  "imageUrls": [],
  "isDiscount": false,
  "discountPercent": null,
  "isNewArrival": true,
  "isFastMoving": false,
  "material": "Kraft 120gsm",
  "finish": "Matte",
  "keywords": ["paper bag"],
  "industryIds": ["uuid","uuid"]
}
```

Validation:
- `name` 1–120 trimmed, `slug` matches `^[a-z0-9-]{1,120}$`.
- `category` ∈ enum.
- `moq` ≥ 1, `discountPercent` 1–90 when `isDiscount=true`, else must be null.
- Each array ≤ 20 entries; each string ≤ 64 chars.
- `industryIds` 1–8 valid IDs.
- `primaryImageUrl` must be HTTPS on an allow-listed CDN host.

### 8.3 `IndustryDto`

```json
{
  "id": "uuid",
  "displayId": 1,
  "name": "Food & Beverage",
  "slug": "food-beverage",
  "iconKey": "UtensilsCrossed",
  "description": "…",
  "tagline": "…",
  "keywords": ["restaurant","cafe"]
}
```

### 8.4 `BlogDto`

```json
{
  "id": "uuid",
  "slug": "kraft-vs-coated",
  "title": "…",
  "excerpt": "…",
  "template": "educative",
  "status": "published",
  "coverImage":     { "url":"…", "alt":"…", "caption": null },
  "secondaryImage": null,
  "body": { "template": "educative", "data": { "intro":"…","keyPoints":[...],"conclusion":"…" } },
  "author": "Moments Packaging Director",
  "tags": ["bags","kraft"],
  "readingTimeMin": 4,
  "publishedAt": "2025-04-23T10:00:00Z",
  "createdAt":   "2025-04-23T10:00:00Z",
  "updatedAt":   "2025-04-23T10:00:00Z"
}
```

`body` is a discriminated union by `template`. Validate via JSON Schema in
`schema/blog-body/<template>.json`. Reject if `template != body.template`.

#### 8.4.1 Body shapes (mirror `src/data/blogs.ts`)

```jsonc
// educative
{ "intro": "string", "keyPoints": [{"heading":"string","body":"string"}], "conclusion": "string" }

// explanatory
{ "problem": "string", "mechanism": "string", "takeaway": "string" }

// scenario
{ "setup": "string", "challenge": "string", "resolution": "string", "callout": "string?" }

// storyline
{ "hook": "string", "chapters": [{"title":"string","body":"string"}], "closing": "string" }

// announcement
{ "headline": "string", "body": "string", "ctaLabel": "string?", "ctaHref": "string?" }
```

Server-side: compute `readingTimeMin = max(1, round(totalWords / 220))` from
all string fields in the body.

### 8.5 `EnquiryCreateRequest`

```json
{
  "persona": "sme",
  "contact": { "name":"…", "email":"…", "phone":"+254…", "company":"…" },
  "message": "…",
  "source":  "web_form",
  "items": [
    { "productId":"uuid", "qty": 500, "size":"Medium", "finish":"Matte", "notes":"" }
  ]
}
```

Response 201:
```json
{ "id": "uuid", "reference": "ENQ-2025-04-0001" }
```

Server actions: persist with `status='new'`, generate `reference` via
`EnquiryReferenceGenerator` (year-month + zero-padded monthly counter, locked
via `SELECT … FOR UPDATE` on a `enquiry_counters(year_month, last_seq)` table
or via a Postgres sequence per month), increment `products.total_enquiries`
& `monthly_enquiries`, send email to `app.email.sales-inbox`.

### 8.6 `EnquiryStatusUpdateRequest` (PATCH)

```json
{ "status": "in_review", "assignedTo": "uuid|null", "internalNotes": "…" }
```

All fields optional; only provided fields update.

### 8.7 `LeadCreateRequest`

```json
{ "email":"…", "persona":"sme", "source":"insider_prompt", "trigger":"scroll_50" }
```

`source` is required. `trigger` only valid when `source = 'insider_prompt'`.
On duplicate email, return `200 { id }` with the existing record (idempotent).

### 8.8 `LoginResponse`

```json
{
  "accessToken": "ey…",
  "refreshToken": "ey…",
  "user": { "id":"uuid","email":"…","name":"…","roles":["ROLE_ADMIN"] }
}
```

### 8.9 `PublicConfigDto`

```json
{
  "blogsEnabled": true,
  "emailCaptureEnabled": true,
  "whatsappNumber": "254700000000",
  "companyEmail": "sales@momentspackaging.co.ke",
  "companyPhone": "+254 700 000 000"
}
```

### 8.10 Page envelope

`Page<T>` uses Spring's default JSON shape:
```json
{ "content":[…], "totalElements":42, "totalPages":3, "size":20, "number":0,
  "sort":{"sorted":true,"unsorted":false}, "first":true, "last":false }
```

---

## 9. Search ranking

`GET /api/v1/public/products/search?q=&limit=` powers the global search
overlay (`SearchCommand`) and the in-page filter on `/products`. The
frontend implements the algorithm in `src/services/search.ts`. **Mirror it
exactly so the swap-over is invisible.**

### 9.1 Inputs
- `q` — required, **trim**, reject if length < 2 (return `[]`).
- `limit` — optional, default 12, max 50.

### 9.2 Weighted scoring (apply in order, sum the score)

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

Popularity is **additive only** and capped — never overrides relevance,
only breaks ties. Drop any product whose total score is `0`. Sort
`score DESC`, then `monthly_clicks DESC`, then `name ASC`.

### 9.3 Implementation strategy

Do the heavy filtering in Postgres (use the `search_vector` from V003 for a
candidate pool of up to 200 rows), then re-rank in Java applying the exact
weight table above. This avoids encoding the entire weight matrix in SQL
while staying fast.

```sql
-- Candidate pool (Postgres)
SELECT p.* , ts_rank_cd(p.search_vector, plainto_tsquery('simple', unaccent(:q))) AS ts
FROM products p
WHERE p.search_vector @@ plainto_tsquery('simple', unaccent(:q))
   OR lower(p.name) LIKE lower(:q) || '%'
   OR EXISTS (SELECT 1 FROM unnest(p.keywords) k WHERE lower(k) = lower(:q))
ORDER BY ts DESC
LIMIT 200;
```

Then in Java, score each candidate exactly per §9.2, sort, slice to `limit`.
Cache `(q,limit)` → `List<UUID>` in Caffeine for 60 s.

### 9.4 Frontend contract

Returns the same `ProductDto` shape as `GET /products`. No `score` field is
required. If you add one, ensure it's serialized (frontend tolerates extra
fields).

---

## 10. Lead capture

The frontend has **two** capture surfaces, both POSTing to
`/api/v1/public/leads`:

| Surface | Component | When it fires | `source` | `trigger` |
| --- | --- | --- | --- | --- |
| Bottom banner | `EmailCaptureBanner` | Page load (suppressed 7 days after dismiss) | `email_capture_banner` | — |
| Insider slide-in | `EmailInsiderPrompt` | First of: exit-intent / 50% scroll / 30s idle (suppressed 3 days; never if banner already submitted) | `insider_prompt` | `exit_intent` \| `scroll_50` \| `idle_30s` |

Backend rules:
- Accept `{ email, persona, source, trigger }`. Older clients may send only
  `{ email, persona }` — treat missing fields as `null`/`unknown`.
- Idempotent on `email` (UNIQUE). Duplicate POST returns `200 { id }` with
  the existing row id; never `409`.

---

## 11. File storage

- Bucket layout: `<env>/<entity>/<uuid>.<ext>` inside `app.s3.bucket`.
- Allowed types: `image/jpeg`, `image/png`, `image/webp`. Max 5 MB.
- Strip EXIF server-side before upload (use `metadata-extractor` or
  `imageio` to re-encode without metadata).
- Generate either:
  - **Signed PUT URLs** (preferred at scale): `POST /admin/uploads/sign`
    returns `{ uploadUrl, publicUrl, key }`. Frontend PUTs directly to S3.
  - **Multipart proxy** (current frontend flow):
    `POST /admin/uploads/image` accepts `multipart/form-data` field `file`,
    uploads, returns `{ url, key }`.
- Public URLs use the CDN base: `${app.s3.public-base-url}/<key>`.
- CDN must serve with `Cache-Control: public, max-age=31536000, immutable`.

---

## 12. Background jobs

Use `@EnableScheduling` and **ShedLock** with the `shedlock` table from §6
so jobs don't double-run when scaled horizontally. Time zone:
**Africa/Nairobi (EAT, UTC+3)**.

| Job | Schedule (`@Scheduled` + `@SchedulerLock`) | Purpose |
| --- | --- | --- |
| `RollUpProductClicksJob` | Daily 00:30 EAT | `UPDATE products SET total_clicks = ..., monthly_clicks = ...` from the previous day's `product_clicks` rows. Then `DELETE FROM product_clicks WHERE occurred_at < now() - interval '90 days'`. |
| `ResetMonthlyCountersJob` | 1st of month 00:05 EAT | `UPDATE products SET monthly_clicks=0, monthly_enquiries=0`. |
| `LeadDigestEmailJob` | Weekdays 08:00 EAT | Render `lead-digest.html` Thymeleaf template with previous day's enquiries+leads, send to `app.email.sales-inbox`. |
| `RefreshTokenSweepJob` | Daily 03:00 UTC | Delete expired/revoked refresh tokens. |

---

## 13. Errors & validation

Every error returns this exact shape (Jackson `non_null`):

```json
{
  "timestamp": "2025-04-23T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "code": "VALIDATION_FAILED",
  "message": "Human-readable summary",
  "fields": { "title": "must not be blank" },
  "traceId": "<request-id>"
}
```

Standard codes:

| HTTP | code |
| ---: | --- |
| 400 | `VALIDATION_FAILED`, `MALFORMED_JSON` |
| 401 | `UNAUTHORIZED` |
| 403 | `FORBIDDEN` |
| 404 | `NOT_FOUND` |
| 409 | `CONFLICT` (slug/email collision when not idempotent) |
| 413 | `PAYLOAD_TOO_LARGE` (uploads) |
| 415 | `UNSUPPORTED_MEDIA_TYPE` |
| 429 | `RATE_LIMITED` (include `Retry-After` header) |
| 500 | `INTERNAL_ERROR` |

`GlobalExceptionHandler` translates:
- `MethodArgumentNotValidException`, `ConstraintViolationException` → 400 `VALIDATION_FAILED`
- `HttpMessageNotReadableException` → 400 `MALFORMED_JSON`
- `AccessDeniedException` → 403
- `AuthenticationException` → 401
- `EntityNotFoundException`, `NoSuchElementException` → 404
- `DataIntegrityViolationException` → 409 (only when slug/email constraint matches)
- `MaxUploadSizeExceededException` → 413
- everything else → 500 with a generated `traceId` (logged at ERROR with the
  full stack trace; the stack trace MUST NOT appear in the JSON body).

---

## 14. Security checklist

Tick every item before deploying:

- [ ] BCrypt passwords (`BCryptPasswordEncoder`, strength ≥ 12). No SHA-anything.
- [ ] JWT secret ≥ 256 bits, base64, from env/vault. Rotate quarterly.
- [ ] Refresh-token rotation + revocation list in DB. `jti` indexed.
- [ ] CSRF disabled (stateless JWT). No auth cookies — `Authorization` header only.
- [ ] CORS strictly limited to the three production origins (+ localhost in `dev`).
- [ ] Bucket4j rate limits: `/auth/login` 10/min/IP, `/leads` 20/min/IP, `/enquiries` 10/min/IP, `/products/{id}/click` 60/min/IP.
- [ ] Reject `application/x-www-form-urlencoded` on JSON endpoints.
- [ ] `@PreAuthorize` on every admin controller method (use `@IsAdmin` / `@IsStaffOrAdmin`). Verify in tests with `@WithMockUser(roles = "STAFF")` that delete endpoints return 403.
- [ ] `actuator` endpoints: only `health`, `info`, `metrics`, `prometheus` exposed. `prometheus` behind basic auth or network ACL.
- [ ] All admin endpoints log `userId` in the request MDC.
- [ ] Log auth failures with IP + email; alert on > 20/min from one IP (Prometheus alert).
- [ ] No PII in URLs; no secrets in logs (mask `password`, `token`, `email` partially).
- [ ] `springdoc` UI disabled in `prod` profile (or behind admin auth).
- [ ] Run `mvn org.owasp:dependency-check-maven:check` on every CI build; fail on CVSS ≥ 7.
- [ ] HTTPS only (HSTS header `max-age=31536000; includeSubDomains; preload`).
- [ ] `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
- [ ] DB user has `SELECT/INSERT/UPDATE/DELETE` only — no `CREATE/DROP` (Flyway runs as a separate migration user).
- [ ] EXIF stripped from every uploaded image.
- [ ] Image `Content-Type` validated by **magic bytes**, not extension.

---

## 15. Testing strategy

Target coverage: **≥ 80 %** lines, **100 %** of permission/auth/search code.

### 15.1 Pyramid

| Layer | Tool | What |
| --- | --- | --- |
| Unit | JUnit 5 + Mockito | Services, validators, search ranking, slug util, reading-time calc. |
| Slice | `@WebMvcTest`, `@DataJpaTest` | Controller/JSON serialization, repository queries. |
| Integration | `@SpringBootTest` + Testcontainers (Postgres + LocalStack) + REST-assured | Full request → DB → response. **One test per endpoint minimum**, plus role-based access tests. |
| Contract | `pact-jvm` (optional) | Lock the JSON shapes against the React client. |
| Load | `k6` script in `/load/` | Search endpoint at 200 RPS, p95 < 150 ms. |

### 15.2 Mandatory test cases

- `AuthIntegrationTest`: login success, wrong password, expired token, refresh rotation, logout revokes refresh.
- `RoleEnforcementIntegrationTest`: for each admin endpoint, assert
  - anonymous → 401
  - STAFF → 200/403 per the matrix in §3.2
  - ADMIN → 200
- `ProductSearchTest`: 20+ fixture products, assert ranking matches the
  frontend's `src/services/search.ts` for canonical queries
  (`"kraft"`, `"juice cup"`, `"matte black"`, `"unboxing"`).
- `LeadIdempotencyTest`: same email twice → second response is 200 with same id.
- `EnquiryReferenceTest`: 1000 concurrent submissions all produce unique references.
- `BlogBodyValidationTest`: per template, valid + every invalid permutation rejected.
- `RateLimitTest`: 11th login in 60 s returns 429 with `Retry-After`.
- `SchemaTest`: assert `JPA validate` mode passes against Flyway migrations
  (this catches drift between entities and SQL).

---

## 16. Observability & ops

- **Logs**: Logback with `LogstashEncoder`; one JSON line per event;
  include `timestamp`, `level`, `logger`, `message`, `traceId`, `userId`,
  `requestId`. Ship to ELK / Loki via Filebeat or stdout collection.
- **Metrics** (Prometheus, scrape `/actuator/prometheus`):
  - `http_server_requests_seconds` (built-in) — alert on `5xx > 1 %` over 5 min.
  - `auth_login_failures_total{reason}` — alert on `> 20/min/ip`.
  - `enquiries_submitted_total`, `leads_submitted_total{source}`.
  - `product_search_duration_seconds` (histogram).
  - `email_send_duration_seconds`, `email_send_failures_total`.
  - `rate_limit_blocked_total{endpoint}`.
  - `scheduled_job_duration_seconds{name}`, `scheduled_job_failures_total{name}`.
- **Tracing** (optional): Micrometer Tracing → OTLP. Propagate `traceparent` end-to-end.
- **Health checks**:
  - `/actuator/health/liveness` — process is up.
  - `/actuator/health/readiness` — DB + S3 reachable + Flyway migrations applied.
- **Backups**: Postgres logical dumps daily 02:00 EAT, retain 30 days.
- **DR target**: RPO 24h, RTO 4h.

---

## 17. Docker, CI/CD, deployment

### 17.1 Multi-stage `Dockerfile`

```dockerfile
# --- build stage ---
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw -B -ntp dependency:go-offline
COPY src ./src
RUN ./mvnw -B -ntp -DskipTests package && \
    mv target/*.jar app.jar

# --- runtime stage ---
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S app && adduser -S app -G app
USER app
WORKDIR /app
COPY --from=build /workspace/app.jar app.jar
EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseZGC -Djava.security.egd=file:/dev/./urandom"
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s \
  CMD wget -qO- http://localhost:8080/actuator/health/liveness || exit 1
ENTRYPOINT ["java","-jar","app.jar"]
```

### 17.2 `docker-compose.yml` (local dev)

```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: moments
      POSTGRES_USER: moments
      POSTGRES_PASSWORD: moments
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
  s3:
    image: localstack/localstack:3
    environment: { SERVICES: s3, AWS_DEFAULT_REGION: eu-west-1 }
    ports: ["4566:4566"]
  mailhog:
    image: mailhog/mailhog
    ports: ["1025:1025","8025:8025"]
volumes: { pgdata: {} }
```

### 17.3 CI pipeline (GitHub Actions sketch)

```yaml
name: ci
on: [push, pull_request]
jobs:
  build-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env: { POSTGRES_PASSWORD: ci, POSTGRES_DB: moments_ci, POSTGRES_USER: ci }
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U ci" --health-interval 5s --health-retries 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: 21, cache: maven }
      - run: ./mvnw -B -ntp verify
      - run: ./mvnw -B -ntp org.owasp:dependency-check-maven:check -DfailBuildOnCVSS=7
      - uses: docker/build-push-action@v6
        with: { push: false, tags: moments-backend:ci }
```

### 17.4 Deployment (recommended)

- Container on Fly.io / Railway / Render / Hetzner / AWS ECS Fargate.
- Managed Postgres (Neon, Supabase, AWS RDS, DO Managed PG).
- Cloudflare R2 or AWS S3 for uploads, Cloudflare in front for CDN.
- TLS terminated at the platform LB; HSTS header set by the app.

---

## 18. Mapping to the React frontend

The React app already calls these methods through `src/services/api.ts`.
Each TODO comment in that file points to the exact endpoint. **Do not
rename anything.**

| Frontend call | Backend endpoint | Notes |
| --- | --- | --- |
| `api.getConfig()` | `GET /public/config` | |
| `api.getIndustries()` | `GET /public/industries` | |
| `api.getProducts(params)` | `GET /public/products?…` | |
| `api.searchProducts(q, limit)` | `GET /public/products/search?q=&limit=` | |
| `api.getRecommended()` | `GET /public/products/recommended` | |
| `api.trackClick(id)` | `POST /public/products/{id}/click` | Fire-and-forget. |
| `api.getBlogs(params)` | `GET /public/blogs?…` | |
| `api.getBlogBySlug(slug)` | `GET /public/blogs/{slug}` | |
| `api.getLatestBlogs(limit)` | `GET /public/blogs/latest?limit=` | |
| `api.getRelatedBlogs(slug, limit)` | `GET /public/blogs/{slug}/related?limit=` | |
| `api.submitEnquiry(payload)` | `POST /public/enquiries` | |
| `api.submitLead(email, persona)` | `POST /public/leads` | Frontend will start sending `source`/`trigger`. |
| `blogStore.create/update/delete` (admin UI) | `/admin/blogs/**` | localStorage today; flips to `fetch` once backend is live. |
| `productStore.create/update/delete` (admin UI) | `/admin/products/**` | Same swap-over story. |
| `AdminAuthContext.login()` | `POST /auth/login` | Stores `accessToken` + `refreshToken` in memory + httpOnly cookie? **No** — frontend stores in `localStorage` today. Discuss with frontend before changing. |

When the backend is ready:
1. Replace `blogStore` / `productStore` internals with `fetch` against
   `/api/v1/admin/...`.
2. Drop the in-memory store re-export from `src/services/api.ts`.
3. Flip `VITE_API_URL` in `.env` to point to the deployed backend.

The component layer doesn't change — that's the whole point of routing
every call through the `api` façade.

---

## 19. Acceptance criteria checklist

The agent should self-verify each item before declaring done:

- [ ] `./mvnw clean verify` exits 0 with zero warnings.
- [ ] `docker compose up -d && ./mvnw spring-boot:run` boots in < 15 s on a laptop.
- [ ] All endpoints in §7 return the exact JSON in §8 (verified by integration tests).
- [ ] Role matrix in §3.2 enforced server-side (verified by `RoleEnforcementIntegrationTest`).
- [ ] Search results match `src/services/search.ts` for the canonical queries in §15.2.
- [ ] Lead idempotency: duplicate email returns 200 with same id.
- [ ] Enquiry reference unique under 1000 concurrent submissions.
- [ ] Rate limits trigger 429 with `Retry-After`.
- [ ] All security checklist items in §14 ticked.
- [ ] `springdoc` UI renders every endpoint at `/swagger-ui.html` (dev only).
- [ ] Prometheus metrics exposed; Grafana dashboard JSON committed under `/ops/grafana/`.
- [ ] README has: how to run locally, how to run tests, env-var table, how to seed an admin user (`POST /admin/users` is admin-only, so seed via Flyway `R__seed_admin.sql` reading `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD` env vars on first boot, then mark idempotent).

---

## 20. Open questions for the project owner

These are **the only** decisions the agent should escalate rather than
assume:

1. **Hosting target** — Fly.io vs Railway vs AWS vs Hetzner? Affects S3
   choice (R2 vs AWS S3) and how secrets are injected.
2. **Initial admin seeding** — confirm bootstrap admin email / password
   should come from env vars, not committed.
3. **Email provider** — SMTP credentials (SendGrid, AWS SES, Brevo)?
4. **Domain for CDN** — confirm `cdn.momentspackaging.com` will be CNAME'd
   to the bucket / Cloudflare.

Everything else in this document is intentionally prescriptive.
