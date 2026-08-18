# GATD — Program Registrations Backend

A small Node.js/Express + MySQL service that captures **Program Registration**
form submissions from the GATD website: it validates the input, prices the
selected programmes **server-side** from an authoritative catalog, and stores
each submission.

> Scope (current phase): public form **capture** + a token-protected **read** API
> (list/detail) behind admin **login/signup**. The full dashboard UI, role-based
> permissions, status workflow, and notifications from the spec are still future
> work; the data model already leaves room for them.

## Tech stack

- **Runtime:** Node.js + Express
- **Database:** MySQL (via the `mysql` driver, connection pool)
- **Dev:** `nodemon`

## Project structure

```
backend/
├── app.js                       # Express setup, CORS, routes, server start
├── database/
│   ├── schema.sql               # registrations: programs catalog, registrations, …
│   └── solutions_schema.sql     # content: parent_solutions, child_solutions, solution_programs
└── src/
    ├── config/db.js             # MySQL pool + query()/withTransaction() helpers
    ├── controllers/
    │   ├── registrationsController.js       # public create
    │   ├── registrationsAdminController.js  # protected list + detail
    │   ├── programsController.js            # registrations pricing catalog
    │   ├── authController.js                # signup / login / me
    │   ├── parentSolutionsController.js     # content: parent CRUD
    │   ├── childSolutionsController.js      # content: child CRUD + programmes projection
    │   ├── solutionProgramsController.js    # content: program CRUD + layout validation
    │   └── publicSolutionsController.js     # content: public reads
    ├── routes/                  # one file per resource above
    ├── middleware/
    │   ├── rateLimit.js         # in-memory per-IP limiter for the public POST
    │   └── auth.js              # requireAdmin (JWT bearer)
    └── utils/
        ├── validate.js          # registration input validation
        ├── countries.js         # ISO-2 -> dial-code map
        ├── reference.js         # REG-YYYY-###### generation
        ├── money.js             # cents -> display formatting
        ├── password.js  jwt.js  # bcrypt + JWT helpers
        ├── slug.js  json.js     # slug gen/validate + JSON-column parse/stringify
        ├── listQuery.js         # shared pagination + sort helpers
        └── http.js              # JSON error envelope helper
```

## Environment variables

Create `backend/.env` (git-ignored):

```
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=gatd
DB_PORT=3306

# Comma-separated allowed website origins. Empty = allow all (dev only).
CORS_ORIGINS=

# Auth (dashboard)
JWT_SECRET=change-this-to-a-long-random-secret   # sign/verify tokens — make it long & random
JWT_EXPIRES_IN=12h
ADMIN_SIGNUP_KEY=change-this-signup-key           # shared secret required to create accounts
```

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Create backend/.env (see above)

# 3. Create the database + tables (see "Database setup")

# 4. Run (auto-reloads via nodemon)
npm start          # dev
# or
npm run serve      # plain node, for production
```

On success you'll see `[db] Connected to MySQL 'gatd' database` and
`GATD registrations API running on http://<ip>:5000`.

## Database setup

```sql
CREATE DATABASE gatd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then load the schema (also seeds the 8 programmes; re-runnable):

```bash
mysql -u root gatd < database/schema.sql
# or: npm run db:setup
```

Tables: `programs`, `registrations`, `registration_programs`, `counters`.
Money is stored as integer **cents**; timestamps are **UTC**.

## API

Base path: `/apis`. All responses are JSON.

### `GET /health`
Liveness check → `{ "status": "ok" }`.

### `GET /apis/programs`
Public. Active programmes with authoritative pricing (use these `slug`s when
submitting).

```json
{
  "data": [
    { "slug": "strategic-hr-business-partnership",
      "title": "Strategic HR Business Partnership & Beyond",
      "priceCents": 385000, "priceFormatted": "SGD 3,850", "currency": "SGD" }
  ]
}
```

### `POST /apis/registrations`
Public. Create a registration. Rate-limited (5 / 10 min, 50 / day per IP).

**Request**
```json
{
  "firstName": "Aisha",
  "email": "aisha@example.com",
  "phoneCountry": "AE",
  "phoneNumber": "501234567",
  "country": "United Arab Emirates",
  "designation": "HR Director",
  "organization": "Acme Group",
  "hearAboutUs": "LinkedIn",
  "programSlugs": ["strategic-hr-business-partnership", "performance-rewards"],
  "sourcePage": "/solutions/strategic-hr",
  "utm": { "source": "google", "medium": "cpc", "campaign": "hr-q3" },
  "honeypot": ""
}
```

- `programSlugs` must come from `GET /apis/programs`.
- `totalAmount` is **never** trusted from the client — the server recomputes it.
- `honeypot` must be empty; a filled value is silently accepted and dropped.

**Success `201 Created`**
```json
{
  "data": {
    "referenceNo": "REG-2026-000123",
    "status": "new",
    "currency": "SGD",
    "totalAmountCents": 665000,
    "totalAmountFormatted": "SGD 6,650",
    "programs": [
      { "slug": "strategic-hr-business-partnership", "title": "Strategic HR Business Partnership & Beyond", "unitPriceCents": 385000 },
      { "slug": "performance-rewards", "title": "Performance Development and Rewards Management", "unitPriceCents": 280000 }
    ]
  }
}
```

An identical resubmission (same email + same programmes) within 10 minutes
returns the existing `referenceNo` with `200 OK` instead of creating a duplicate.

**Errors** use a consistent envelope:
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": { "email": "Must be a valid email address" } } }
```

| Status | code | When |
|---|---|---|
| 400 | `BAD_REQUEST` | Malformed JSON |
| 413 | `PAYLOAD_TOO_LARGE` | Body over 32 KB |
| 422 | `VALIDATION_ERROR` | Field validation failed / unknown programme |
| 422 | `CURRENCY_MISMATCH` | Selected programmes span multiple currencies |
| 429 | `RATE_LIMITED` | Too many submissions |
| 500 | `SERVER_ERROR` | Unexpected error |

## Contact form

### `POST /apis/contact`
Public. Capture a "Get In Touch" message. Rate-limited (5 / 10 min, 50 / day per IP),
honeypot-protected.

**Request**
```json
{
  "firstName": "Jane Doe",
  "email": "jane@example.com",
  "phoneCountry": "AE",
  "phoneNumber": "501234567",
  "subject": "Partnership enquiry",
  "message": "Hi, I'd like to know more…",
  "sourcePage": "/contact",
  "honeypot": ""
}
```
Required: `firstName`, `email`, `message`. Optional: `phoneCountry`+`phoneNumber`
(dial code derived server-side), `subject`, `sourcePage`. `honeypot` must be empty.

**Success `201`** → `{ "data": { "id": 12, "received": true } }`
(honeypot-filled requests return `{ "data": { "received": true } }` and store nothing).
Errors: `422 VALIDATION_ERROR` (per-field), `429 RATE_LIMITED`.

### Admin (token required)
- `GET /apis/contact` — list (query `q`, `status`, `includeSpam`, `page`, `pageSize`)
- `GET /apis/contact/export` — download `.xlsx` (default) or `.csv` (`?format=csv`), honoring the list filters
- `GET /apis/contact/:id` — full message detail
- `PATCH /apis/contact/:id` — update status (`new` | `read` | `replied` | `archived`)

Table: `contact_messages` (`database/contact_schema.sql`). Load with `npm run db:setup`.

## Brochure leads

Captures "Download Brochure" submissions from **Solution** and **Program** pages
(one table, `source_type` distinguishes them).

### `POST /apis/brochure-leads`
Public. Rate-limited (10 / 10 min, 80 / day per IP), honeypot-protected.
```json
{
  "sourceType": "program",            // 'solution' | 'program'
  "itemSlug": "strategic-hr-business-partnership",
  "itemTitle": "SHRBP Certification",
  "brochure": "/brochures/shrbp.pdf",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "country": "United Kingdom",
  "organization": "Acme",
  "sourcePage": "/solutions/strategic-hr/strategic-hr-business-partnership",
  "honeypot": ""
}
```
Required: `name`, `email`, `country`. `sourceType` defaults to `program` if omitted.
**`201`** → `{ "data": { "id": 5, "received": true } }`.

### Admin (token required)
- `GET /apis/brochure-leads` — list (query `q`, `sourceType`, `status`, `includeSpam`, `page`, `pageSize`)
- `GET /apis/brochure-leads/export` — `.xlsx` (default) / `.csv` (`?format=csv`), honoring filters
- `GET /apis/brochure-leads/:id` — detail
- `PATCH /apis/brochure-leads/:id` — update status (`new` | `contacted` | `archived`)

Table: `brochure_leads` (`database/brochure_schema.sql`). Load with `npm run db:setup`.

## Dashboard auth

Accounts live in `admin_users`. Tokens are JWTs sent as `Authorization: Bearer <token>`.

### `POST /apis/auth/signup`
Create an account. **Requires** header `x-signup-key: <ADMIN_SIGNUP_KEY>` so only
your team can register. Body: `{ "name", "email", "password" }` (password ≥ 8
chars). Returns `{ data: { user, token } }` (`201`). `409` if the email exists.

### `POST /apis/auth/login`
Body `{ "email", "password" }` → `{ data: { user, token } }` (`200`).
`401 INVALID_CREDENTIALS` on bad email/password.

### `GET /apis/auth/me`
Requires a token → the current account `{ data: { id, name, email, role } }`.

## Admin — view registrations (token required)

### `GET /apis/registrations`
List submissions. **Requires a bearer token.** Query params:

```
?status=new,contacted     # CSV of statuses
&q=aisha                  # search name / email / organization / reference_no
&dateFrom=2026-08-01&dateTo=2026-08-31
&includeSpam=false        # default false
&sort=-created_at         # created_at | status | total_amount_cents ('-' = desc)
&page=1&pageSize=25       # pageSize max 100
```

Response: `{ "data": [ … ], "meta": { "page", "pageSize", "total", "totalPages" } }`.

### `GET /apis/registrations/:id`
Full detail incl. programmes and internal fields (IP, user-agent, UTM, notes).
Requires a bearer token. `404` if not found.

### `GET /apis/registrations/export`
Download all registrations matching the **same filters** as the list
(`status`, `q`, `dateFrom`, `dateTo`, `includeSpam`, `sort`). Requires a bearer token.
- Default returns a real **`.xlsx`** (`Content-Type: …spreadsheetml.sheet`).
- `?format=csv` returns a UTF-8 **`.csv`** (BOM included so Excel reads it correctly).
- Filename: `registrations-YYYY-MM-DD.xlsx` (via `Content-Disposition: attachment`).
- Columns: reference, name, email, phone, country, designation, organisation,
  heard-about-us, programmes, programme count, currency, total amount, status,
  spam, source page, UTM ×3, submitted-at (UTC). Capped at 100,000 rows.

> **Frontend:** because the token goes in the `Authorization` header, trigger the
> download via fetch-as-blob rather than a plain link:
> ```js
> const res = await fetch(`${API}/apis/registrations/export`, { headers: { Authorization: `Bearer ${token}` } });
> const blob = await res.blob();
> const url = URL.createObjectURL(blob);
> const a = Object.assign(document.createElement("a"), { href: url, download: "registrations.xlsx" });
> a.click(); URL.revokeObjectURL(url);
> ```

**Auth error codes:** `401 UNAUTHENTICATED` (no token), `401 INVALID_TOKEN` /
`401 TOKEN_EXPIRED`, `403 FORBIDDEN` (bad signup key), `403 SIGNUP_DISABLED`.

## Solutions & Programs (content module)

Manages the nested catalog: **Parent Solution → Child Solution → Program**
(tables `parent_solutions`, `child_solutions`, `solution_programs`). This is the
CMS content — separate from the registrations pricing catalog (`programs`).

Load its schema: `mysql -u root gatd < database/solutions_schema.sql` (or `npm run db:setup` loads both). No seed — populate via the admin API (or send me the frontend `lib/*.js` files and I'll write a seed).

### Admin (token required) — `content editor` operations
All under `/apis/admin`, all require `Authorization: Bearer <token>`. Resources are
addressed by **slug**. Bodies are camelCase; nested arrays/objects **replace** wholesale on PATCH.

| Method | Path | Purpose |
|---|---|---|
| GET/POST | `/apis/admin/parent-solutions` | List (filter `?q=&isActive=&sort=&page=&pageSize=`) / create |
| GET/PATCH/DELETE | `/apis/admin/parent-solutions/:slug` | Read (incl. `childCount`) / update / soft-delete (`?cascade=true`) |
| GET | `/apis/admin/parent-solutions/:slug/children` | Children of a parent |
| POST | `/apis/admin/parent-solutions/reorder` | Body `{ "order": ["slug-a","slug-b"] }` |
| GET/POST | `/apis/admin/child-solutions` | List (`?parent=&q=&isActive=…`) / create (needs `parentSlug`) |
| GET/PATCH/DELETE | `/apis/admin/child-solutions/:slug` | Read (incl. `programmes` projection) / update / soft-delete (`?cascade=true`) |
| GET | `/apis/admin/child-solutions/:slug/programs` | Programs of a child |
| POST | `/apis/admin/child-solutions/reorder` | Reorder |
| GET/POST | `/apis/admin/programs` | List (`?childSolution=&isPublished=…`) / create (needs `childSolutionSlug`) |
| GET/PATCH/DELETE | `/apis/admin/programs/:slug` | Read / update / soft-delete |
| POST | `/apis/admin/programs/reorder` | Reorder |

**Programs** carry the rich detail-page content: `overview`, `gains`, `focusAreas`,
`faqs`, `facilitator`, `certification`, plus `layoutType` + `layoutData` (one of 8
layouts — `strategic_pillars`, `precision_pillars`, `people_strategy_panels`,
`learning_journey`, `org_framework`, `session_plan`, `curriculum`, `hexagons`).
Setting `layoutType` requires a `layoutData` with at least `heading`, `badge`, `days`.

### Public (no auth) — consumed by the static site at build time
| Method | Path | Returns |
|---|---|---|
| GET | `/apis/public/solutions` | All active parents, each with active children |
| GET | `/apis/public/solutions/:parentSlug` | One parent + its children |
| GET | `/apis/public/child-solutions/:slug` | One child + its published programmes |
| GET | `/apis/public/programs` | All published programs (for `generateStaticParams`) |
| GET | `/apis/public/programs/:slug` | One full published program |

Public endpoints only return `is_active = 1` records (programs also require
`is_published = 1`) and omit internal fields.

**Errors:** `409 SLUG_CONFLICT` (duplicate slug), `409 HAS_CHILDREN` / `409 HAS_PROGRAMS`
(delete blocked — pass `?cascade=true`), `422 VALIDATION_ERROR` (incl. bad `layoutType`
or missing `parentSlug`/`childSolutionSlug`), `404 NOT_FOUND`.

## Notes / future work

- Built so far: registration capture + token-gated reads (login/signup), and the
  full Solutions/Programs content module (admin CRUD + public reads).
- **Not yet built** (spec, future): dashboard UI, the role-based permission matrix
  (single `admin` role today; `role` column is ready for more), registration status
  workflow + history, CSV export, notifications, media-upload endpoint, and the
  static-site rebuild webhook.
- **Two `programs` concepts exist by design:** the registrations pricing catalog
  (`programs` table, `GET /apis/programs`) and the CMS content (`solution_programs`,
  `/apis/admin/programs`). They can drift on price — consolidate later once content
  is seeded (single source of truth for programme + price).
- The rate limiter is in-memory (single instance). For multiple instances, back it with Redis.
- The form should submit programme **slugs**. If the site currently sends numeric
  ids, map them to slugs before calling this API (or update the form).
