# Program Registrations — Backend Specification

**Module:** Program Registrations
**Owner:** Backend / Dashboard team
**Frontend source of truth:** [`components/Solutions/Programs/ProgramRegistration.jsx`](../components/Solutions/Programs/ProgramRegistration.jsx)
**Program catalog / pricing source:** [`lib/programsData.js`](../lib/programsData.js)
**Status:** Draft v1 — for backend implementation

---

## 1. Purpose & Scope

The public GATD website renders a **Program Registration** form on every certified-programme page. A visitor fills in their contact details, selects **one or more** programmes, and submits. Today the form's `handleSubmit` does nothing (`e.preventDefault()` only) — **submissions are lost**.

This document specifies the backend needed to:

1. **Capture** registrations from the public form into a database.
2. **Manage** them through a lifecycle in an internal **dashboard** (list, filter, assign, change status, add notes, export).
3. **Notify** staff and applicants on new submissions.
4. Enforce **validation, pricing integrity, security, and role-based access**.

### Architectural constraint

The website is built with `next.config.mjs → output: "export"` (a fully static site). **It cannot host server-side API routes.** Therefore:

- The backend is a **separate service** (e.g. Node/Express, NestJS, or any framework) with its own database.
- The static frontend calls the backend over HTTPS via **CORS**-allowed cross-origin requests.
- This spec is written to be **stack-agnostic**; SQL examples use **PostgreSQL** conventions and API examples use **REST/JSON**. Adapt as needed.

---

## 2. What the Frontend Collects (field mapping)

From the component's `form` state + selection state:

| UI field                      | Form key             | Notes                                                                                          |
| ----------------------------- | -------------------- | ---------------------------------------------------------------------------------------------- |
| First Name                    | `firstName`          | Free text. No last-name field today (see Open Questions).                                      |
| Email Address                 | `email`              | Free text, `type="email"`.                                                                     |
| Phone Number                  | `phone`              | Digits typed by the user.                                                                      |
| Phone country (flag selector) | `dialCode`           | ISO-2 country code, e.g. `"AE"`; maps to a dial code (`+971`). Defaults to `AE`.               |
| Country                       | `country`            | **Separate free-text input** (distinct from the phone selector).                               |
| Designation                   | `designation`        | Job title.                                                                                     |
| Organization                  | `organization`       | Company/employer.                                                                              |
| "From where do you hear?"     | `source`             | Lead-source free text.                                                                         |
| Programme(s)                  | `selectedPrograms[]` | Multi-select; each `{ id, label, price }`. **At least one required for a valid registration.** |
| Total                         | `totalAmount`        | Computed **client-side** — **do not trust**; recompute server-side (§7).                       |

> ⚠️ The client currently identifies programmes by ad-hoc numeric `id`s (`1,2,3,4,9,10,11,12`) that **do not** match the programme slugs used in routing/data. The backend must key programmes on a **stable `slug`** (§3.1). Recommend updating the form to submit slugs; until then, maintain an id→slug map on the server.

---

## 3. Data Model

### Entity overview

```
programs (catalog, seeded)
    │ 1
    │
    │ *                 * ┌───────────────────────────┐
registration_programs ───┤ registrations              │
    (line items)         └───────────────────────────┘
                               │ 1        │ 1
                               │ *        │ *
                registration_status_history   (assigned_to → admin_users)
                                              admin_users (dashboard auth)
```

### 3.1 `programs` — catalog & authoritative pricing (seed/reference)

Prices live here so the server never trusts client-sent amounts, and so pricing can change without a code deploy.

```sql
CREATE TABLE programs (
  id            BIGSERIAL PRIMARY KEY,
  slug          VARCHAR(120) NOT NULL UNIQUE,     -- stable id, e.g. 'strategic-hr-business-partnership'
  title         VARCHAR(255) NOT NULL,
  price_cents   INTEGER      NOT NULL CHECK (price_cents >= 0),  -- store money as integer minor units
  currency      CHAR(3)      NOT NULL DEFAULT 'SGD',
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  sort_order    INTEGER      NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

**Seed data** (from `lib/programsData.js`; SGD):

| slug                                | title                                          | price (SGD) |
| ----------------------------------- | ---------------------------------------------- | ----------- |
| `strategic-hr-business-partnership` | Strategic HR Business Partnership & Beyond     | 3850        |
| `business-people-leadership`        | Impactful Business and People Leadership       | 3850        |
| `performance-rewards`               | Performance Development and Rewards Management | 2800        |
| `resourcing-talent-learning`        | Resourcing, Talent and Learning Management     | 2800        |
| `impactive-hr`                      | Impactive HR for the Uninitiated               | 2800        |
| `progressing-org-development`       | Progressing Organization Development           | 2800        |
| `advancing-trainer-development`     | Advancing Trainer Development (ToT)            | 2800        |
| `management-best-practices`         | Management: Best Practices for Best Results    | 3850        |

### 3.2 `registrations` — one row per submitted form

```sql
CREATE TABLE registrations (
  id                BIGSERIAL PRIMARY KEY,
  reference_no      VARCHAR(20)  NOT NULL UNIQUE,      -- human-friendly, e.g. 'REG-2026-000123'
  -- applicant
  first_name        VARCHAR(120) NOT NULL,
  last_name         VARCHAR(120),                      -- optional / future
  email             VARCHAR(255) NOT NULL,
  phone_country     CHAR(2)      NOT NULL,             -- ISO-2, e.g. 'AE'
  phone_dial_code   VARCHAR(6)   NOT NULL,             -- e.g. '+971'
  phone_number      VARCHAR(32)  NOT NULL,             -- national number as entered
  country           VARCHAR(120),                      -- free-text country field
  designation       VARCHAR(160),
  organization      VARCHAR(200),
  hear_about_us     VARCHAR(200),                      -- 'From where do you hear?'
  -- commercial (server-computed, §7)
  currency          CHAR(3)      NOT NULL DEFAULT 'SGD',
  total_amount_cents INTEGER     NOT NULL DEFAULT 0,
  -- lifecycle
  status            VARCHAR(24)  NOT NULL DEFAULT 'new',   -- see §9 enum
  assigned_to       BIGINT       REFERENCES admin_users(id) ON DELETE SET NULL,
  internal_notes    TEXT,
  -- context / provenance / anti-spam
  source_page       VARCHAR(255),                      -- URL/slug the form was submitted from
  utm_source        VARCHAR(120),
  utm_medium        VARCHAR(120),
  utm_campaign      VARCHAR(120),
  ip_address        INET,
  user_agent        TEXT,
  is_spam           BOOLEAN      NOT NULL DEFAULT FALSE,
  -- soft delete + audit
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_registrations_status      ON registrations(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_registrations_email       ON registrations(email);
CREATE INDEX idx_registrations_created_at  ON registrations(created_at DESC);
CREATE INDEX idx_registrations_assigned_to ON registrations(assigned_to);
```

### 3.3 `registration_programs` — line items (many-to-many + price snapshot)

Each selected programme is stored with a **price snapshot** so historical registrations keep the price that applied at submission time, even if `programs.price_cents` changes later.

```sql
CREATE TABLE registration_programs (
  id               BIGSERIAL PRIMARY KEY,
  registration_id  BIGINT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  program_id       BIGINT REFERENCES programs(id) ON DELETE SET NULL,
  program_slug     VARCHAR(120) NOT NULL,              -- denormalized snapshot
  program_title    VARCHAR(255) NOT NULL,              -- denormalized snapshot
  unit_price_cents INTEGER      NOT NULL,              -- price at time of registration
  currency         CHAR(3)      NOT NULL DEFAULT 'SGD',
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (registration_id, program_slug)               -- no duplicate programme per registration
);

CREATE INDEX idx_regprog_registration ON registration_programs(registration_id);
CREATE INDEX idx_regprog_program      ON registration_programs(program_slug);
```

### 3.4 `admin_users` — dashboard accounts

```sql
CREATE TABLE admin_users (
  id            BIGSERIAL PRIMARY KEY,
  name          VARCHAR(160) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,                 -- bcrypt/argon2
  role          VARCHAR(24)  NOT NULL DEFAULT 'viewer',-- see §8
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

### 3.5 `registration_status_history` — audit trail

```sql
CREATE TABLE registration_status_history (
  id               BIGSERIAL PRIMARY KEY,
  registration_id  BIGINT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  from_status      VARCHAR(24),
  to_status        VARCHAR(24) NOT NULL,
  changed_by       BIGINT REFERENCES admin_users(id) ON DELETE SET NULL,
  note             TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_status_hist_registration ON registration_status_history(registration_id, created_at);
```

---

## 4. API Endpoints

Base URL example: `https://api.globalatd.com/v1`. All responses are JSON. All timestamps are **ISO-8601 UTC**. Money is returned both as integer `*_cents` and a formatted string for convenience.

### 4.1 Public (unauthenticated)

#### `POST /registrations` — create a registration

Called by the website form. Rate-limited + spam-protected (§10).

**Request body**

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
  "sourcePage": "/solutions/strategic-hr/strategic-hr-business-partnership",
  "utm": { "source": "google", "medium": "cpc", "campaign": "hr-q3" },
  "honeypot": "" // must be empty; see §10
}
```

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
      {
        "slug": "strategic-hr-business-partnership",
        "title": "Strategic HR Business Partnership & Beyond",
        "unitPriceCents": 385000
      },
      {
        "slug": "performance-rewards",
        "title": "Performance Development and Rewards Management",
        "unitPriceCents": 280000
      }
    ]
  }
}
```

**Errors:** `422` validation (§6), `429` rate-limited, `400` malformed JSON.
The response deliberately **omits** internal fields (id, notes, IP, assignment).

### 4.2 Auth

| Method | Path           | Purpose                                                      |
| ------ | -------------- | ------------------------------------------------------------ |
| `POST` | `/auth/login`  | Email + password → JWT (access + refresh) or session cookie. |
| `POST` | `/auth/logout` | Invalidate session/refresh token.                            |
| `GET`  | `/auth/me`     | Current admin user + role.                                   |

### 4.3 Admin (authenticated + authorized — §8)

| Method           | Path                              | Purpose                                       | Min role    |
| ---------------- | --------------------------------- | --------------------------------------------- | ----------- |
| `GET`            | `/admin/registrations`            | List with filter/search/sort/paginate (§4.4)  | viewer      |
| `GET`            | `/admin/registrations/:id`        | Full detail incl. programmes + status history | viewer      |
| `PATCH`          | `/admin/registrations/:id`        | Update `assignedTo`, `internalNotes`          | sales_agent |
| `POST`           | `/admin/registrations/:id/status` | Transition status (§9) with optional note     | sales_agent |
| `POST`           | `/admin/registrations/:id/spam`   | Flag/unflag as spam                           | admin       |
| `DELETE`         | `/admin/registrations/:id`        | **Soft** delete (`deleted_at`)                | admin       |
| `GET`            | `/admin/registrations/export`     | CSV/XLSX export honoring current filters      | viewer      |
| `GET`            | `/admin/registrations/stats`      | Dashboard metrics (§13)                       | viewer      |
| `GET`            | `/admin/programs`                 | List programmes + prices                      | viewer      |
| `POST`           | `/admin/programs`                 | Create programme                              | super_admin |
| `PATCH`          | `/admin/programs/:id`             | Update price/title/active                     | admin       |
| `GET/POST/PATCH` | `/admin/users`                    | Manage dashboard accounts                     | super_admin |

### 4.4 List endpoint contract — `GET /admin/registrations`

**Query params**

```
?status=new,contacted        # CSV of statuses
&assignedTo=5                 # admin_user id  (or 'unassigned')
&program=strategic-hr-business-partnership
&q=aisha                      # search name/email/org/reference_no
&dateFrom=2026-08-01&dateTo=2026-08-31
&includeSpam=false
&sort=-created_at             # '-' = desc; allow created_at, status, total_amount_cents
&page=1&pageSize=25           # pageSize max 100
```

**Response**

```json
{
  "data": [
    {
      "id": 123,
      "referenceNo": "REG-2026-000123",
      "firstName": "Aisha",
      "email": "aisha@example.com",
      "organization": "Acme Group",
      "status": "new",
      "assignedTo": null,
      "totalAmountCents": 665000,
      "programCount": 2,
      "createdAt": "2026-08-07T09:14:22Z"
    }
  ],
  "meta": { "page": 1, "pageSize": 25, "total": 342, "totalPages": 14 }
}
```

---

## 5. Request/Response Conventions

- **Content-Type:** `application/json; charset=utf-8`.
- **Errors** use a consistent envelope:
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "…",
      "fields": { "email": "Must be a valid email address" }
    }
  }
  ```
- **HTTP codes:** `200` OK, `201` created, `400` bad request, `401` unauthenticated, `403` forbidden, `404` not found, `409` conflict (invalid status transition), `422` validation, `429` rate-limited, `500` server error.
- **Pagination** default `pageSize=25`, hard max `100`.
- **CORS:** allow only the production site origin(s) (e.g. `https://globalatd.com`) for `POST /registrations`; admin routes locked to the dashboard origin.

---

## 6. Validation Rules

Validate **server-side** regardless of client checks. Reject with `422` and per-field messages.

| Field          | Required            | Rules                                                                                                                 |
| -------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `firstName`    | ✅                  | 2–120 chars; letters/spaces/`.-'` ; trim; strip control chars.                                                        |
| `email`        | ✅                  | Valid RFC-5322 email; ≤255; lowercased; MX/deliverability optional.                                                   |
| `phoneCountry` | ✅                  | Must be one of the supported ISO-2 codes (§ country list).                                                            |
| `phoneNumber`  | ✅                  | 4–20 chars; digits/spaces/`-`/`(` `)`; strip formatting; optionally validate against dial code with `libphonenumber`. |
| `country`      | ⭕ (recommended ✅) | ≤120 chars.                                                                                                           |
| `designation`  | ⭕                  | ≤160 chars.                                                                                                           |
| `organization` | ⭕ (recommended ✅) | ≤200 chars.                                                                                                           |
| `hearAboutUs`  | ⭕                  | ≤200 chars; consider constraining to an enum later.                                                                   |
| `programSlugs` | ✅                  | Non-empty array; each must exist in `programs` and be `is_active`; de-duplicate; reject unknown slugs.                |
| `sourcePage`   | ⭕                  | ≤255; must be a relative path or same-site URL.                                                                       |
| `utm.*`        | ⭕                  | ≤120 each.                                                                                                            |
| `honeypot`     | ✅ (must be empty)  | If non-empty → silently accept-and-drop as spam (§10).                                                                |

**Normalization:** trim all strings; collapse internal whitespace; store email lowercased; store phone number digits-normalized.
**Note:** the client sends a `totalAmount` — **ignore it**; the server computes the total (§7).

---

## 7. Business Logic

1. **Server-authoritative pricing.** On `POST /registrations`:
   - Look up each `programSlug` in `programs` (must be active).
   - `unit_price_cents` for each line item = current `programs.price_cents` (snapshot into `registration_programs`).
   - `total_amount_cents = Σ unit_price_cents`. **Never** use the client's `totalAmount`.
   - `currency` taken from `programs` (assert all selected share one currency; error if mixed).
2. **Money as integer minor units.** Store cents (e.g. SGD 3,850 → `385000`). Never use floats. Format for display only.
3. **Reference number.** Generate `REG-{YYYY}-{zero-padded sequence}` (unique). Use a DB sequence or atomic counter to avoid collisions.
4. **Duplicate detection.** If same `email` + identical `programSlugs` set submitted within N minutes (e.g. 10), treat as a resubmit: return the existing `referenceNo` rather than creating a duplicate (idempotency window). Optionally flag potential duplicates for staff instead of hard-blocking.
5. **Provenance capture.** Persist `ip_address`, `user_agent`, `source_page`, `utm_*` for lead attribution.
6. **Status defaults.** New rows start at `new`; write an initial `registration_status_history` entry.
7. **Notifications** dispatched asynchronously (queue/worker) so the API responds fast even if email is slow (§11).
8. **Soft delete only.** `DELETE` sets `deleted_at`; excluded from default queries; recoverable by super_admin.

---

## 8. User Roles & Permissions

| Capability                       | super_admin |           admin            |         sales_agent         | viewer |
| -------------------------------- | :---------: | :------------------------: | :-------------------------: | :----: |
| View registrations (list/detail) |     ✅      |             ✅             | ✅ (all or only assigned\*) |   ✅   |
| Search / filter / export         |     ✅      |             ✅             |             ✅              |   ✅   |
| Change status                    |     ✅      |             ✅             |             ✅              |   ❌   |
| Assign / reassign                |     ✅      |             ✅             |      ✅ (self-claim)\*      |   ❌   |
| Edit internal notes              |     ✅      |             ✅             |             ✅              |   ❌   |
| Flag/unflag spam                 |     ✅      |             ✅             |             ❌              |   ❌   |
| Soft delete / restore            |     ✅      | ✅ (delete) / ❌ (restore) |             ❌              |   ❌   |
| Manage programmes & prices       |     ✅      |             ✅             |             ❌              |   ❌   |
| Manage dashboard users           |     ✅      |             ❌             |             ❌              |   ❌   |

\* Decide policy: whether `sales_agent` sees all registrations or only those assigned to them (see Open Questions). Enforce authorization on **every** admin endpoint (never rely on the UI hiding actions).

---

## 9. Registration Workflow & Status Management

### Status enum

```
new          → freshly submitted, untouched
contacted    → staff reached out to the applicant
in_review    → qualifying / gathering info
confirmed    → seat/place confirmed by applicant & GATD
invoiced     → invoice/payment link sent, awaiting payment
paid         → payment received
enrolled     → onboarded into the programme (terminal-success)
cancelled    → applicant withdrew (terminal)
rejected     → not proceeding / disqualified (terminal)
spam         → junk (terminal; usually set via is_spam flag)
```

### Allowed transitions (state machine)

```
new        → contacted | in_review | cancelled | rejected | spam
contacted  → in_review | confirmed | cancelled | rejected
in_review  → confirmed | cancelled | rejected
confirmed  → invoiced | cancelled
invoiced   → paid | cancelled
paid       → enrolled | cancelled(refund)
enrolled   → (terminal)
cancelled / rejected / spam → (terminal; super_admin may reopen to 'new')
```

- Reject invalid transitions with `409 Conflict`.
- Every transition writes a `registration_status_history` row (from, to, by, note, timestamp).
- Optionally trigger notifications on specific transitions (e.g. `confirmed`, `invoiced`).

### Workflow summary

1. Visitor submits form → `new` + confirmation email to applicant + new-lead alert to staff.
2. Sales claims/assigned → `contacted` → `in_review`.
3. On agreement → `confirmed` → `invoiced` → `paid` → `enrolled`.
4. Drop-offs go to `cancelled` / `rejected`; junk to `spam`.

---

## 10. Security & Anti-Spam

- **Transport:** HTTPS only; HSTS.
- **CORS allow-list:** restrict `POST /registrations` to the production website origin(s); admin routes to the dashboard origin.
- **Rate limiting:** e.g. per-IP 5 submissions / 10 min and 50 / day on `POST /registrations`; `429` on exceed.
- **Honeypot field:** hidden input the form leaves empty; bots fill it → mark `is_spam=true`, return a fake success, don't notify.
- **CAPTCHA (recommended):** Cloudflare Turnstile / reCAPTCHA v3 token verified server-side.
- **Input sanitization:** trim/normalize; store as text (parameterized queries → no SQL injection); escape on render in the dashboard to prevent stored XSS.
- **Auth:** bcrypt/argon2 password hashing; JWT (short-lived access + refresh) or secure httpOnly session cookies; lockout/backoff on repeated failed logins.
- **Authorization:** enforce the §8 matrix on every endpoint server-side.
- **Audit logging:** status changes (via history table); optionally log admin logins, exports, deletes.
- **PII / compliance:** registrations contain personal data. Support: consent capture (see below), data-retention policy, right-to-erasure (hard-delete on request), access limited by role, encryption at rest for the DB.
- **Consent:** add a privacy/consent checkbox to the form and store `consent_at` + policy version (recommended for GDPR/PDPA). _(Not in the current form — see Open Questions.)_

---

## 11. Notifications

Dispatched asynchronously (queue + worker) so API latency is unaffected.

| Trigger                  | Recipient                 | Content                                                                                                   |
| ------------------------ | ------------------------- | --------------------------------------------------------------------------------------------------------- |
| New registration (`new`) | Staff inbox / sales group | Reference no, name, email, phone, org, selected programmes, total, source page. Link to dashboard detail. |
| New registration (`new`) | Applicant                 | Thank-you / confirmation with selected programmes + next steps.                                           |
| `confirmed`              | Applicant                 | Confirmation + joining details.                                                                           |
| `invoiced`               | Applicant                 | Invoice / payment link.                                                                                   |

**Provider:** replace the site's current Web3Forms usage (contact form) with a transactional email service for these (e.g. Amazon SES, SendGrid, Resend, Postmark). Always persist to DB first, then email — email is a side effect, not the record of truth. Store delivery status if possible.

---

## 12. Non-Functional Requirements

- **Timezones:** store UTC (`TIMESTAMPTZ`); format per-viewer in the dashboard.
- **Indexing:** as defined in §3 (status, email, created_at, assigned_to, program slug).
- **Pagination everywhere** for list endpoints; never return unbounded sets.
- **Idempotency** on `POST /registrations` via the duplicate window (§7.4) or an `Idempotency-Key` header.
- **Observability:** request logging, error tracking (e.g. Sentry), health-check endpoint.
- **Backups:** automated DB backups + tested restore.
- **Migrations:** version-controlled schema migrations (e.g. Prisma/Knex/Flyway).
- **Testing:** unit tests for validation + pricing; integration tests for create + status transitions + authz.

---

## 13. Dashboard Reporting / Stats (`GET /admin/registrations/stats`)

Suggested metrics for dashboard cards/charts:

- Total registrations (all-time, this month, today).
- Count by **status** (funnel: new → contacted → … → enrolled).
- Count & **revenue (sum of totals)** by programme.
- Conversion rate (`enrolled` or `paid` ÷ total).
- Registrations over time (daily/weekly series).
- Top lead sources (`hear_about_us`, `utm_source`).
- Unassigned / aging leads (e.g. `new` older than X days).

```json
{
  "totals": { "all": 342, "thisMonth": 58, "today": 6 },
  "byStatus": {
    "new": 41,
    "contacted": 22,
    "confirmed": 15,
    "paid": 9,
    "enrolled": 30,
    "cancelled": 12
  },
  "byProgram": [
    {
      "slug": "strategic-hr-business-partnership",
      "count": 88,
      "revenueCents": 33880000
    }
  ],
  "revenueCents": 91250000,
  "topSources": [{ "source": "LinkedIn", "count": 61 }]
}
```

---

## 14. Open Questions / Assumptions

1. **Last name** — the form captures only `firstName`. Add a last-name field, or keep single-name? (schema already allows `last_name`).
2. **Country duplication** — the form has both a phone-flag country selector and a free-text "Country" field. Keep both, or derive one from the other?
3. **Consent/privacy checkbox** — not on the form today; required for GDPR/PDPA compliance. Add?
4. **Payment** — is payment collected online (needs a gateway: Stripe/checkout) or handled offline via invoice? This spec assumes **offline/invoice** (`invoiced → paid`).
5. **sales_agent visibility** — can agents see all registrations or only assigned ones?
6. **Program identifiers** — update the frontend to submit **slugs** instead of the current numeric `id`s (recommended) to remove the id→slug mapping shim.
7. **Multi-currency** — all current prices are SGD. Confirm no per-region pricing is needed.
8. **Retention** — how long to keep registrations, and automated purge policy?

---

## 15. Implementation Checklist

- [ ] Create tables + migrations (§3) and seed `programs` (§3.1).
- [ ] `POST /registrations` with validation (§6), server pricing (§7), spam protection (§10).
- [ ] Auth (login/logout/me) + role middleware (§8).
- [ ] Admin list/detail/patch/status/spam/delete/export/stats (§4).
- [ ] Status state-machine enforcement + history logging (§9).
- [ ] Async notifications (§11).
- [ ] CORS, rate limiting, CAPTCHA/honeypot (§10).
- [ ] Wire the frontend form's `handleSubmit` to `POST /registrations` (replace the current no-op).
- [ ] Tests (validation, pricing, transitions, authz) + backups + monitoring.
