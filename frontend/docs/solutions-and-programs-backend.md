# Solutions & Programs — Backend API Specification

**Modules:** Parent Solutions · Child Solutions · Programs (CRUD)
**Frontend data source (current, static):** [`lib/solutionsData.js`](../lib/solutionsData.js), [`lib/programsData.js`](../lib/programsData.js), and the catalog in [`components/Solutions/SolutionsCatalog.jsx`](../components/Solutions/SolutionsCatalog.jsx)
**Related spec:** [`program-registrations-backend.md`](./program-registrations-backend.md) — reuse its shared conventions (auth, roles, errors, pagination).
**Status:** Draft v1 — for backend implementation

---

## 1. Purpose & Scope

Provide a REST API + database to **manage the Solutions content** currently hard-coded in the frontend, through three nested resources:

```
Parent Solution   (category)          e.g. "Certified Programs", "Executive Educational Program"
   └── Child Solution   (a solution)  e.g. "Strategic Human Resources…", "Women in Leadership"
          └── Program   (detail page) e.g. "Strategic HR Business Partnership & Beyond"
```

- A **Parent Solution** is a top-level catalog category (the 9 rows on `/solutions`).
- A **Child Solution** belongs to one Parent Solution and has its own page (hero, gains, audience, why-invest, brochure, rating).
- A **Program** belongs to one Child Solution and has the richest detail page (overview, pillars/curriculum, focus areas, FAQs, facilitator, certification, pricing, rating, brochure).

> **Normalization note:** Today the "Our Programmes" cards on a Child-Solution page live in a `programmes[]` array *and* the full pages live in `programsData.js` — duplicated. This spec **unifies** them: the programme cards are just a **summary projection of the Programs** that belong to that Child Solution. A Program that has no full page yet is simply `isPublished: false` (renders as a card, no detail link).

### Architectural constraint (same as the registrations module)

The website is a **static export** (`next.config.mjs → output: "export"`). It cannot run server APIs. So:
- This is a **separate backend service + database**; examples use **PostgreSQL** + **REST/JSON**.
- The **public read endpoints** (§7) are consumed **at build time** by `generateStaticParams()` / data fetching, or the site is rebuilt when content changes (webhook). The **admin write endpoints** power the dashboard.

---

## 2. Shared Conventions

(See the registrations spec for full detail; summarized here.)

- **Base URL:** `https://api.globalatd.com/v1`. All JSON, UTF-8, timestamps ISO-8601 UTC.
- **Identifiers:** every resource has a numeric `id` **and** a unique `slug`. **Path lookups use `slug`** (matches the site's routing). `POST` may omit slug to auto-generate from `title`.
- **Auth:** admin endpoints require a bearer token/session. **Roles:** `super_admin`, `admin`, `content_editor`, `viewer` (§8).
- **Money:** store integer minor units (`price_cents`) + `currency` (default `SGD`).
- **Pagination:** list endpoints accept `page` (1-based) and `pageSize` (default 25, max 100); return a `meta` block.
- **Sorting:** `?sort=field` / `?sort=-field` (desc). Default `sort_order` asc, then `title` asc.
- **Soft delete:** `DELETE` sets `deleted_at`; excluded from default queries; restorable by `super_admin`.
- **Publish flag:** `is_active` (visible on the site). Public endpoints only return `is_active = true`.
- **Error envelope:**
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "…", "fields": { "slug": "Already in use" } } }
  ```
- **HTTP codes:** `200`, `201`, `400`, `401`, `403`, `404`, `409` (slug conflict / FK/cascade violation), `422` (validation), `429`, `500`.

---

## 3. Data Model

### 3.1 `parent_solutions`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | bigint (PK) | auto | |
| `slug` | string(120) unique | ✅ | e.g. `certified-programs`. kebab-case. |
| `title` | string(255) | ✅ | e.g. `Certified Programs`. |
| `description` | text | ⭕ | Optional intro. |
| `is_active` | boolean | — | default `true`. |
| `sort_order` | int | — | default 0; controls catalog row order. |
| `created_at` / `updated_at` / `deleted_at` | timestamptz | auto | |

### 3.2 `child_solutions`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | bigint (PK) | auto | |
| `parent_solution_id` | bigint FK → parent_solutions | ✅ | The category it belongs to. |
| `slug` | string(120) unique | ✅ | e.g. `strategic-hr`. Used in `/solutions/{slug}`. |
| `eyebrow` | string(120) | ⭕ | Small label above title. |
| `title` | string(255) | ✅ | |
| `description` | text | ✅ | Card + hero description. |
| `subheading` | string(255) | ⭕ | Hero subheading. |
| `subtext` | text | ⭕ | Hero paragraph. |
| `banner` | string(URL/path) | ⭕ | Hero banner image. |
| `card_image` | string(URL/path) | ⭕ | Thumbnail in the catalog row. |
| `programmes_heading` | string(255) | ⭕ | Heading of the programmes carousel. |
| `map_image` | string(URL/path) | ⭕ | "Commitment to excellence" map image. |
| `gains_heading` | string(255) | ⭕ | |
| `gains` | json (array) | ⭕ | See §6.1. |
| `why_heading` / `why_badge` / `why_image` | string | ⭕ | "Why worth the investment" block. |
| `audience_badge` / `audience_heading` / `audience_image` | string | ⭕ | "Designed for" block. |
| `audience` | json (string[]) | ⭕ | e.g. `["Senior HR Leaders & Directors", …]`. |
| `brochure` | string(URL/path) | ⭕ | PDF under `/brochures/…`. |
| `rating` | numeric(2,1) | ⭕ | 0.0–5.0 (catalog card + hero). |
| `reviews` | int | ⭕ | ≥ 0. |
| `is_active` | boolean | — | default `true`. |
| `sort_order` | int | — | order within the parent category. |
| timestamps | timestamptz | auto | |

### 3.3 `programs`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | bigint (PK) | auto | |
| `child_solution_id` | bigint FK → child_solutions | ✅ | |
| `slug` | string(120) unique | ✅ | e.g. `strategic-hr-business-partnership`. Used in `/solutions/{parent}/{slug}`. |
| `eyebrow` | string(120) | ⭕ | e.g. `Certified Programs`. |
| `title` | string(255) | ✅ | |
| `description` | text | ✅ | |
| `banner` | string(URL/path) | ⭕ | Detail-page hero image. |
| `card_image` | string(URL/path) | ⭕ | Thumbnail on the parent's programmes carousel. |
| `subheading` / `subtext` | string/text | ⭕ | |
| `rating` | numeric(2,1) | ⭕ | 0.0–5.0. |
| `reviews` | int | ⭕ | ≥ 0. |
| `price_cents` | int | ⭕ | Authoritative price (e.g. 385000 = SGD 3,850). |
| `currency` | char(3) | — | default `SGD`. |
| `pricing_period` | string(40) | ⭕ | e.g. `/Person`. |
| `pricing_heading` | string(120) | ⭕ | e.g. `Why It's Worth`. |
| `pricing_description` | text | ⭕ | |
| `brochure` | string(URL/path) | ⭕ | |
| `registration_heading` | string(255) | ⭕ | Heading for the registration form. |
| `overview` | json (object) | ⭕ | `{ title, description, image }`. |
| `gains_heading` | string(255) | ⭕ | |
| `gains` | json (array) | ⭕ | §6.1. |
| `focus_heading` | string(255) | ⭕ | |
| `focus_areas` | json (array) | ⭕ | §6.2. |
| `faqs` | json (array) | ⭕ | §6.3. |
| `facilitator` | json (object) | ⭕ | §6.4. |
| `certification` | json (object) | ⭕ | §6.5. |
| `layout_type` | enum | ⭕ | One of the programme-content layouts (§6.6). |
| `layout_data` | json | ⭕ | Layout-specific content (§6.6). |
| `is_published` | boolean | — | default `true`. If `false`, renders as a card with no detail link. |
| `is_active` | boolean | — | default `true`. |
| `sort_order` | int | — | order within the child solution. |
| timestamps | timestamptz | auto | |

> `gains`, `focus_areas`, `faqs`, `facilitator`, `certification`, `overview`, and `layout_data` are stored as **JSONB** because their shapes vary (especially `layout_data`). The backend may instead normalize `gains`/`focus_areas`/`faqs` into child tables — either is acceptable; the JSON shapes in §6 are the contract the frontend expects.

---

## 4. Parent Solutions API

### Endpoints

| Method | Path | Purpose | Min role |
|---|---|---|---|
| `GET` | `/admin/parent-solutions` | List (paginated, filter/sort) | viewer |
| `GET` | `/admin/parent-solutions/:slug` | Single, incl. child count | viewer |
| `POST` | `/admin/parent-solutions` | Create | content_editor |
| `PATCH` | `/admin/parent-solutions/:slug` | Partial update (incl. `is_active`, `sort_order`) | content_editor |
| `DELETE` | `/admin/parent-solutions/:slug` | Soft delete (see cascade §9) | admin |

**List query params:** `?q=` (search title/slug), `?isActive=true|false`, `?sort=sort_order`, `?page=`, `?pageSize=`.

### POST `/admin/parent-solutions`
Request:
```json
{ "slug": "certified-programs", "title": "Certified Programs",
  "description": "Executive-level certifications…", "isActive": true, "sortOrder": 4 }
```
Response `201`:
```json
{ "data": { "id": 4, "slug": "certified-programs", "title": "Certified Programs",
  "description": "Executive-level certifications…", "isActive": true, "sortOrder": 4,
  "childCount": 0, "createdAt": "2026-08-09T10:00:00Z", "updatedAt": "2026-08-09T10:00:00Z" } }
```

### PATCH `/admin/parent-solutions/:slug`
Send only fields to change (partial):
```json
{ "title": "Certified Programmes", "sortOrder": 2 }
```
Response `200`: the full updated object.

### DELETE `/admin/parent-solutions/:slug`
- Soft delete. **Blocked with `409`** if it still has active child solutions unless `?cascade=true` is passed (super_admin only) — see §9.

### Validation
- `slug`: required, unique, `^[a-z0-9]+(?:-[a-z0-9]+)*$`, ≤120.
- `title`: required, 2–255.
- `sortOrder`: integer ≥ 0.

---

## 5. Child Solutions API

### Endpoints

| Method | Path | Purpose | Min role |
|---|---|---|---|
| `GET` | `/admin/child-solutions` | List; filter by parent | viewer |
| `GET` | `/admin/parent-solutions/:parentSlug/children` | List children of a parent | viewer |
| `GET` | `/admin/child-solutions/:slug` | Single (full content) | viewer |
| `POST` | `/admin/child-solutions` | Create | content_editor |
| `PATCH` | `/admin/child-solutions/:slug` | Partial update | content_editor |
| `DELETE` | `/admin/child-solutions/:slug` | Soft delete (cascade §9) | admin |

**List query params:** `?parent=certified-programs` (parent slug), `?q=`, `?isActive=`, `?sort=`, `?page=`, `?pageSize=`.

### POST `/admin/child-solutions`
```json
{
  "parentSlug": "certified-programs",
  "slug": "strategic-hr",
  "eyebrow": "Certified Programs",
  "title": "Strategic Human Resources, Business Leadership and Management",
  "description": "This suite offers eight executive-level certifications…",
  "subheading": "Advance Your Expertise in Strategic HR…",
  "subtext": "The Strategic Human Resources… Program helps professionals…",
  "banner": "/images/solutions/strategic-hr/banner.jpg",
  "cardImage": "/images/solutions/Certified-Programs/certified-1.jpg",
  "programmesHeading": "Strategic HR Programme Suite",
  "mapImage": "/images/solutions/strategic-hr/map.jpg",
  "gainsHeading": "What You'll Gain From This Certification Suite",
  "gains": [ { "iconSrc": "/images/solutions/strategic-hr/1.svg", "text": "Develop deep expertise…" } ],
  "whyHeading": "Why this Suite is Worth the Investment",
  "whyBadge": "Invest in building results that last",
  "whyImage": "/images/solutions/strategic-hr/plan.jpg",
  "audienceBadge": "Who is This",
  "audienceHeading": "Programme Suite Designed For?",
  "audienceImage": "/images/solutions/strategic-hr/programme-suits.jpg",
  "audience": ["Senior HR Leaders & Directors", "Aspiring C-Suite & High-Potentials"],
  "brochure": "/brochures/strategic-human-resources-and-management.pdf",
  "rating": 4.9,
  "reviews": 428,
  "isActive": true,
  "sortOrder": 1
}
```
Response `201`: full object incl. `id`, `parentSolutionId`, timestamps, and `programCount`.

### GET `/admin/child-solutions/:slug`
Returns the full record **plus its programmes** (projection of child Programs):
```json
{ "data": {
  "id": 12, "slug": "strategic-hr", "parentSlug": "certified-programs",
  "title": "Strategic Human Resources, Business Leadership and Management",
  "rating": 4.9, "reviews": 428, "isActive": true, "sortOrder": 1,
  "gains": [ … ], "audience": [ … ],
  "programmes": [
    { "slug": "strategic-hr-business-partnership", "title": "Strategic HR Business Partnership and Beyond",
      "description": "A 3-day executive certification…", "image": "/images/solutions/strategic-hr/prog-1.jpg",
      "rating": 4.9, "reviews": 486, "isPublished": true,
      "href": "/solutions/strategic-hr/strategic-hr-business-partnership" }
  ],
  "createdAt": "…", "updatedAt": "…"
} }
```
- `programmes[].href` is derived: `/solutions/{parent... actually child slug}/{programSlug}` when `isPublished`, else `"#"`.

### PATCH / DELETE
- `PATCH`: partial; may include nested arrays (`gains`, `audience`) — a provided array **replaces** the stored one (send the full array).
- `DELETE`: soft delete; `409` if it has active Programs unless `?cascade=true` (super_admin).

### Validation
- `parentSlug`: required, must reference an existing (non-deleted) parent → else `422`.
- `slug`: required, unique, kebab-case, ≤120.
- `title`, `description`: required.
- `rating`: 0.0–5.0, one decimal. `reviews`: integer ≥ 0.
- `gains[]`: each `{ text (required, ≤300), iconSrc (optional path/URL) }`.
- `audience[]`: array of non-empty strings.
- Image/brochure fields: valid relative path (`/images/…`, `/brochures/…`) or absolute URL.

---

## 6. Programs API

### Endpoints

| Method | Path | Purpose | Min role |
|---|---|---|---|
| `GET` | `/admin/programs` | List; filter by child solution | viewer |
| `GET` | `/admin/child-solutions/:childSlug/programs` | List programs of a child | viewer |
| `GET` | `/admin/programs/:slug` | Single (full content) | viewer |
| `POST` | `/admin/programs` | Create | content_editor |
| `PATCH` | `/admin/programs/:slug` | Partial update | content_editor |
| `DELETE` | `/admin/programs/:slug` | Soft delete | admin |

**List query params:** `?childSolution=strategic-hr`, `?q=`, `?isActive=`, `?isPublished=`, `?sort=`, `?page=`, `?pageSize=`.

### POST `/admin/programs`
```json
{
  "childSolutionSlug": "strategic-hr",
  "slug": "strategic-hr-business-partnership",
  "eyebrow": "Certified Programs",
  "title": "Strategic HR Business Partnership & Beyond (SHRBP) Certification",
  "description": "A 3-day executive SHRBP certification programme…",
  "banner": "/images/solutions/Programs/strategic-hr-banner.jpg",
  "cardImage": "/images/solutions/strategic-hr/prog-1.jpg",
  "rating": 4.9,
  "reviews": 486,
  "priceCents": 385000,
  "currency": "SGD",
  "pricingPeriod": "/Person",
  "pricingHeading": "Why It's Worth",
  "pricingDescription": "By enrolling, you'll earn a respected EIU-Paris credential…",
  "brochure": "/brochures/strategic-hr-business-partnership.pdf",
  "registrationHeading": "Strategic HR Business Partnership & Beyond (SHRBP)",
  "overview": { "title": "Strategic HR Business Partner Certification",
                "description": "This program is a strategic initiative…",
                "image": "/images/solutions/strategic-hr/SHRBP-overview.png" },
  "gainsHeading": "What You'll Gain From This Certification",
  "gains": [ { "iconSrc": "/images/solutions/strategic-hr/6.svg", "text": "Position HR as a strategic business partner" } ],
  "focusHeading": "Focuses on Developing",
  "focusAreas": [ { "iconSrc": "/images/solutions/strategic-hr/1.svg",
                    "title": "Strategic HR Alignment",
                    "description": "Strategic thinking aligned with business priorities" } ],
  "faqs": [ { "question": "Who is this programme for?", "answer": "This program is for Senior HR Managers…" } ],
  "facilitator": {
    "name": "Prof. Dr. Joel Farnworth",
    "role": "Dean of Business and Management Studies, EIU-Paris",
    "image": "/images/solutions/strategic-hr/Dr_Joel.png",
    "bg": "/images/solutions/strategic-hr/program_facilitator_BG.png",
    "expertise": ["Human Resource Management", "Leadership Development"],
    "biography": ["Coach and Consultant", "Strategic HR Management"]
  },
  "certification": {
    "badge": "Recognised Speaker Credentials",
    "heading": "Certification\non Successful\nCompletion",
    "image": "/images/solutions/strategic-hr/certificate_image.jpg",
    "paragraphs": ["When you complete the program…", "This certification recognizes…"]
  },
  "layoutType": "strategic_pillars",
  "layoutData": { "heading": "3 Strategic Pillars", "badge": "3 Days",
                  "days": [ { "label": "DAY 1", "id": "day1" } ],
                  "modulesByDay": { "day1": [ { "arrowTitle": "…", "labelPosition": "bottom",
                                                "sideLabel": "…", "sideDescription": "…" } ] } },
  "isPublished": true,
  "isActive": true,
  "sortOrder": 1
}
```
Response `201`: full stored object incl. `id`, `childSolutionId`, `priceFormatted` (e.g. `"SGD 3,850"`), timestamps.

### PATCH / DELETE
- `PATCH`: partial. Nested objects/arrays (`overview`, `gains`, `focusAreas`, `faqs`, `facilitator`, `certification`, `layoutData`) — when provided, **replace** the stored value wholesale (send the complete object/array).
- Changing `layoutType` **requires** a matching `layoutData` in the same request → else `422`.
- `DELETE`: soft delete. No children below Programs, so no cascade needed.

### Validation
- `childSolutionSlug`: required, must reference an existing child solution → else `422`.
- `slug`: required, unique across **all** programs, kebab-case, ≤120.
- `title`, `description`: required.
- `rating` 0.0–5.0; `reviews` ≥ 0; `priceCents` integer ≥ 0; `currency` ISO-4217 (default `SGD`).
- `overview` (if present): `{ title, description, image }` — title & description required.
- `gains[]`, `focusAreas[]`, `faqs[]`, `facilitator`, `certification`: shapes per §6.1–6.5.
- `layoutType` ∈ enum (§6.6); if set, `layoutData` must be present and valid for that type.

---

## 6.x Shared Nested Content Schemas

### 6.1 `gains[]`
```json
[ { "iconSrc": "/images/solutions/strategic-hr/1.svg", "text": "Short benefit statement" } ]
```
- `text` required (≤300). `iconSrc` optional (path/URL to an SVG/image). Frontend renders a fixed icon if omitted.

### 6.2 `focusAreas[]`
```json
[ { "iconSrc": "…/1.svg", "title": "Strategic HR Alignment", "description": "…" } ]
```
- `title` required (≤120), `description` required (≤400), `iconSrc` optional.

### 6.3 `faqs[]`
```json
[ { "question": "Who is this programme for?", "answer": "…" } ]
```
- `question` (≤255) and `answer` (≤2000) required. Order preserved (or add `sortOrder`).

### 6.4 `facilitator` (object)
```json
{ "name": "…", "role": "…", "image": "…", "bg": "…",
  "expertise": ["…"], "biography": ["…"] }
```
- `name` required; `expertise` / `biography` are string arrays.

### 6.5 `certification` (object)
```json
{ "badge": "…", "heading": "Line 1\nLine 2", "image": "…", "paragraphs": ["…", "…"] }
```
- `heading` may contain `\n` for manual line breaks. `paragraphs` is a string array.

### 6.6 Programme content layouts — `layoutType` + `layoutData`

Each Program renders **one** content layout. `layoutType` selects the frontend component; `layoutData` holds its content. Enum values and the `layoutData` shape each expects:

| `layoutType` | Frontend component | `layoutData` shape (summary) |
|---|---|---|
| `strategic_pillars` (default) | StrategicPillars | `{ heading, badge, days:[{label,id}], modulesByDay:{ [dayId]: [{arrowTitle,labelPosition,sideLabel,sideDescription}] } }` |
| `precision_pillars` | PrecisionManagement | `{ heading, badge, days:[{label, nodes:[{circleTitle,color,sideHeading,bullets[]}]}] }` |
| `people_strategy_panels` | PeopleStrategyPanels | `{ heading, badge, days:[{label, sessions:[{title, bullets[]}]}] }` |
| `learning_journey` | LearningJourney | `{ heading, badge, days:[{label, pillars:[{title, description, footer}]}] }` |
| `org_framework` | OrgDevelopmentFramework | `{ heading, badge, days:[{label, sessions:[{color,title,bullets[]}]}] }` |
| `session_plan` | TrainerSessions | `{ heading, badge, days:[{label, sessions:[{color,title,bullets[]}]}] }` |
| `curriculum` | ExecutiveCurriculum | `{ heading, badge, days:[{label, sessions:[{color,title,bullets[]}]}] }` |
| `hexagons` | PerformanceHexagons | `{ heading, badge, days:[{label, sessions:[{color,title,description}]}] }` |

- `color` values are `"red"` or `"dark"`.
- The backend should validate `layoutData` against the shape for the chosen `layoutType` (a JSON-schema per type is recommended). Treat unknown keys leniently but require the top-level `heading`, `badge`, and `days`.

---

## 7. Public (read-only) Endpoints

Consumed by the site at build time (or a rebuild webhook). Only return `is_active = true` records; Programs also respect `is_published`.

| Method | Path | Returns |
|---|---|---|
| `GET` | `/solutions` | All parent solutions, each with their active child solutions (for the catalog). |
| `GET` | `/solutions/:parentSlug` | One parent + its children. |
| `GET` | `/child-solutions/:slug` | One child solution + its programmes projection (§5). |
| `GET` | `/programs/:slug` | One full program (all content). |
| `GET` | `/programs` | All published programs (for `generateStaticParams`). |

Public payloads **omit** internal fields (`is_active` housekeeping, `deleted_at`, internal ids optional). Add `ETag`/`Last-Modified` for build-cache friendliness.

---

## 8. Roles & Permissions

| Capability | super_admin | admin | content_editor | viewer |
|---|:---:|:---:|:---:|:---:|
| Read (list/detail) | ✅ | ✅ | ✅ | ✅ |
| Create / update (all three resources) | ✅ | ✅ | ✅ | ❌ |
| Toggle `is_active` / `is_published`, reorder | ✅ | ✅ | ✅ | ❌ |
| Soft delete | ✅ | ✅ | ❌ | ❌ |
| Cascade delete / restore deleted | ✅ | ❌ | ❌ | ❌ |

Enforce authorization on **every** endpoint server-side (never rely on the dashboard hiding buttons).

---

## 9. Referential Integrity & Cascade

- **Create** requires the parent to exist and be non-deleted (`422` otherwise).
- **Delete** is soft (`deleted_at`).
- Deleting a **Parent** with active children → `409 Conflict` unless `?cascade=true` (super_admin), which soft-deletes descendants too.
- Deleting a **Child Solution** with active Programs → `409` unless `?cascade=true`.
- **Slug immutability (recommended):** slugs map to live URLs. Changing a slug should be allowed only by `admin+`, and the backend should optionally record the old slug for a redirect (avoid breaking bookmarked/indexed URLs).
- Uniqueness scope: `parent_solutions.slug`, `child_solutions.slug`, `programs.slug` are each globally unique within their table.

---

## 10. Reordering & Publishing

- **Reorder:** either `PATCH …/:slug { "sortOrder": n }` per item, or a bulk endpoint:
  `POST /admin/{resource}/reorder` with `{ "order": ["slug-a", "slug-b", …] }` → server assigns `sort_order` by index.
- **Publish/unpublish:** `PATCH …/:slug { "isActive": false }` (and `isPublished` for programs). Public endpoints and the next site build then exclude it.

---

## 11. Media / Assets (out of core scope, but define)

Image/brochure fields currently accept **paths** the site already ships (`/images/…`, `/brochures/…`) or absolute URLs. Two options for the dashboard:
1. **Path/URL string only** (simplest): the editor pastes an existing path or an external URL. Validate format.
2. **Upload endpoint** (recommended later): `POST /admin/media` (multipart) → stores to disk/S3, returns `{ url }`; the returned URL is saved in the resource field. If added, run the same image compression as [`scripts/optimize-images.mjs`](../scripts/optimize-images.mjs) on upload.

---

## 12. Non-Functional

- Version-controlled DB migrations; seed the 9 parent solutions, existing child solutions, and 8 programs from the current `lib/*.js`.
- Indexes: `slug` (unique) on all three; `parent_solution_id`, `child_solution_id`, `is_active`, `sort_order`.
- Validate `layoutData` per `layoutType` (JSON schema).
- Rebuild trigger: on any successful write, optionally fire a webhook to rebuild/redeploy the static site (since it's `output: export`).
- Tests: slug uniqueness, FK/cascade rules, layout validation, publish filtering on public endpoints, authz.

---

## 13. Open Questions / Assumptions

1. **Parent-solution rating** — currently only child solutions & programs have ratings; parents don't. Confirm parents need none.
2. **Programme cards vs Programs** — this spec unifies them (cards = published Programs). Confirm no child solution needs "cards" that are *not* Programs. If some do, add a lightweight `is_published:false` Program (already supported).
3. **Slug changes & redirects** — do we need old→new slug redirect handling to preserve SEO?
4. **Static rebuild vs dynamic** — will the site fetch these APIs at build time (rebuild on change) or move to on-demand/ISR (would require dropping `output: export`)?
5. **Media** — path/URL strings only, or a real upload service?
6. **Localization** — any need for multi-language content later (would affect the schema)?

---

## 14. Implementation Checklist

- [ ] Tables + migrations for `parent_solutions`, `child_solutions`, `programs` (§3) and seed from `lib/*.js`.
- [ ] Parent Solutions CRUD (§4).
- [ ] Child Solutions CRUD + programmes projection (§5).
- [ ] Programs CRUD + `layoutType`/`layoutData` validation (§6).
- [ ] Public read endpoints (§7) with active/published filtering.
- [ ] Roles/authz (§8), cascade & slug rules (§9), reorder/publish (§10).
- [ ] (Optional) media upload (§11) + site-rebuild webhook.
- [ ] Tests + seed + docs for the frontend integration.
