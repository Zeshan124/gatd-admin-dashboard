const { query, withTransaction } = require("../config/db");
const { slugify, isValidSlug } = require("../utils/slug");
const { parseJson, toJsonColumn } = require("../utils/json");
const { parsePaging, parseSort, pageMeta } = require("../utils/listQuery");
const { formatMoney } = require("../utils/money");
const { sendError } = require("../utils/http");

const SORT_FIELDS = { sort_order: "sort_order", title: "title", rating: "rating", price_cents: "price_cents", created_at: "created_at" };

const LAYOUT_TYPES = new Set([
  "strategic_pillars", "precision_pillars", "people_strategy_panels", "learning_journey",
  "org_framework", "session_plan", "curriculum", "hexagons",
]);

const STRING_FIELDS = [
  ["eyebrow", "eyebrow"], ["banner", "banner"], ["card_image", "cardImage"], ["subheading", "subheading"],
  ["subtext", "subtext"], ["pricing_period", "pricingPeriod"], ["pricing_heading", "pricingHeading"],
  ["pricing_description", "pricingDescription"], ["brochure", "brochure"], ["registration_heading", "registrationHeading"],
  ["gains_heading", "gainsHeading"], ["focus_heading", "focusHeading"],
];

// A link target is safe only if it's a same-site relative path (/…, not //) or an
// http(s) absolute URL — this blocks javascript:/data:/vbscript: XSS in the href.
const SAFE_LINK_RE = /^(https?:\/\/|\/(?!\/))/i;

function mapProgram(r) {
  return {
    id: r.id,
    childSolutionId: r.child_solution_id,
    childSolutionSlug: r.child_slug,
    slug: r.slug,
    eyebrow: r.eyebrow,
    title: r.title,
    description: r.description,
    banner: r.banner,
    cardImage: r.card_image,
    subheading: r.subheading,
    subtext: r.subtext,
    rating: r.rating != null ? Number(r.rating) : null,
    reviews: r.reviews,
    priceCents: r.price_cents,
    currency: r.currency,
    priceFormatted: r.price_cents != null ? formatMoney(r.price_cents, r.currency) : null,
    pricingPeriod: r.pricing_period,
    pricingHeading: r.pricing_heading,
    pricingDescription: r.pricing_description,
    brochure: r.brochure,
    isClickable: !!r.is_clickable,
    linkUrl: r.link_url,
    registrationHeading: r.registration_heading,
    overview: parseJson(r.overview),
    gainsHeading: r.gains_heading,
    gains: parseJson(r.gains),
    focusHeading: r.focus_heading,
    focusAreas: parseJson(r.focus_areas),
    faqs: parseJson(r.faqs),
    facilitator: parseJson(r.facilitator),
    certification: parseJson(r.certification),
    layoutType: r.layout_type,
    layoutData: parseJson(r.layout_data),
    isPublished: !!r.is_published,
    isActive: !!r.is_active,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// --- validators ------------------------------------------------------------

function validateGains(v) {
  if (!Array.isArray(v)) return "gains must be an array";
  for (const g of v) {
    if (!g || typeof g !== "object") return "each gain must be an object";
    if (typeof g.text !== "string" || !g.text.trim() || g.text.length > 300) return "each gain needs text (≤300 chars)";
    if (g.iconSrc != null && typeof g.iconSrc !== "string") return "gain iconSrc must be a string";
  }
  return null;
}
function validateFocusAreas(v) {
  if (!Array.isArray(v)) return "focusAreas must be an array";
  for (const f of v) {
    if (!f || typeof f !== "object") return "each focus area must be an object";
    if (typeof f.title !== "string" || !f.title.trim() || f.title.length > 120) return "each focus area needs title (≤120 chars)";
    if (typeof f.description !== "string" || !f.description.trim() || f.description.length > 400) return "each focus area needs description (≤400 chars)";
  }
  return null;
}
function validateFaqs(v) {
  if (!Array.isArray(v)) return "faqs must be an array";
  for (const f of v) {
    if (!f || typeof f !== "object") return "each faq must be an object";
    if (typeof f.question !== "string" || !f.question.trim() || f.question.length > 255) return "each faq needs question (≤255 chars)";
    if (typeof f.answer !== "string" || !f.answer.trim() || f.answer.length > 2000) return "each faq needs answer (≤2000 chars)";
  }
  return null;
}
function validateOverview(o) {
  if (!o || typeof o !== "object" || Array.isArray(o)) return "overview must be an object";
  if (typeof o.title !== "string" || !o.title.trim()) return "overview.title is required";
  if (typeof o.description !== "string" || !o.description.trim()) return "overview.description is required";
  return null;
}
function validateFacilitator(o) {
  if (!o || typeof o !== "object" || Array.isArray(o)) return "facilitator must be an object";
  if (typeof o.name !== "string" || !o.name.trim()) return "facilitator.name is required";
  for (const k of ["expertise", "biography"]) {
    if (o[k] !== undefined && (!Array.isArray(o[k]) || !o[k].every((s) => typeof s === "string"))) return `facilitator.${k} must be an array of strings`;
  }
  return null;
}
function validateCertification(o) {
  if (!o || typeof o !== "object" || Array.isArray(o)) return "certification must be an object";
  if (o.paragraphs !== undefined && (!Array.isArray(o.paragraphs) || !o.paragraphs.every((s) => typeof s === "string"))) return "certification.paragraphs must be an array of strings";
  return null;
}

/** Validate + collect layout_type / layout_data. Returns { cols, fields }. */
function collectLayout(body) {
  const cols = {};
  const fields = {};
  const hasType = body.layoutType !== undefined;
  const hasData = body.layoutData !== undefined;
  if (!hasType && !hasData) return { cols, fields };

  if (hasType) {
    const t = body.layoutType;
    if (t !== null && !LAYOUT_TYPES.has(t)) {
      fields.layoutType = `layoutType must be one of: ${[...LAYOUT_TYPES].join(", ")}`;
    } else {
      cols.layout_type = t;
      if (t && !hasData) fields.layoutData = "layoutData is required when layoutType is set";
    }
  }
  if (hasData) {
    const d = body.layoutData;
    if (d !== null) {
      if (typeof d !== "object" || Array.isArray(d)) fields.layoutData = "layoutData must be an object";
      else if (typeof d.heading !== "string" || typeof d.badge !== "string" || !Array.isArray(d.days)) {
        fields.layoutData = "layoutData requires heading (string), badge (string), and days (array)";
      }
    }
    if (!fields.layoutData) cols.layout_data = toJsonColumn(d);
  }
  return { cols, fields };
}

/** Collect column values shared by create & update. */
function collectColumns(body, { partial }) {
  const cols = {};
  const fields = {};

  if (body.title !== undefined || !partial) {
    const title = String(body.title || "").trim();
    if (!title || title.length < 2 || title.length > 255) fields.title = "Title is required (2–255 chars)";
    else cols.title = title;
  }
  if (body.description !== undefined || !partial) {
    const description = body.description == null ? "" : String(body.description);
    if (!description.trim()) fields.description = "Description is required";
    else cols.description = description;
  }
  for (const [col, key] of STRING_FIELDS) {
    if (body[key] !== undefined) cols[col] = body[key] == null ? null : String(body[key]);
  }
  if (body.rating !== undefined) {
    const n = Number(body.rating);
    if (Number.isNaN(n) || n < 0 || n > 5) fields.rating = "rating must be between 0.0 and 5.0";
    else cols.rating = Math.round(n * 10) / 10;
  }
  if (body.reviews !== undefined) {
    const n = parseInt(body.reviews, 10);
    if (Number.isNaN(n) || n < 0) fields.reviews = "reviews must be an integer ≥ 0";
    else cols.reviews = n;
  }
  if (body.priceCents !== undefined) {
    if (body.priceCents === null) cols.price_cents = null;
    else {
      const n = parseInt(body.priceCents, 10);
      if (Number.isNaN(n) || n < 0) fields.priceCents = "priceCents must be an integer ≥ 0";
      else cols.price_cents = n;
    }
  }
  if (body.currency !== undefined) {
    const c = String(body.currency).toUpperCase();
    if (!/^[A-Z]{3}$/.test(c)) fields.currency = "currency must be a 3-letter ISO code";
    else cols.currency = c;
  }
  if (body.isActive !== undefined) cols.is_active = body.isActive ? 1 : 0;
  if (body.isPublished !== undefined) cols.is_published = body.isPublished ? 1 : 0;
  if (body.isClickable !== undefined) cols.is_clickable = body.isClickable ? 1 : 0;
  if (body.linkUrl !== undefined) {
    const u = body.linkUrl == null ? "" : String(body.linkUrl).trim();
    if (!u) cols.link_url = null;
    else if (!SAFE_LINK_RE.test(u)) fields.linkUrl = "Link URL must be a relative path (/…) or an http(s):// URL";
    else cols.link_url = u;
  }
  if (body.sortOrder !== undefined) {
    const n = parseInt(body.sortOrder, 10);
    if (Number.isNaN(n) || n < 0) fields.sortOrder = "sortOrder must be an integer ≥ 0";
    else cols.sort_order = n;
  }

  // validated JSON fields
  const jsonChecks = [
    ["overview", "overview", validateOverview],
    ["gains", "gains", validateGains],
    ["focus_areas", "focusAreas", validateFocusAreas],
    ["faqs", "faqs", validateFaqs],
    ["facilitator", "facilitator", validateFacilitator],
    ["certification", "certification", validateCertification],
  ];
  for (const [col, key, validate] of jsonChecks) {
    if (body[key] === undefined) continue;
    if (body[key] === null) { cols[col] = null; continue; }
    const err = validate(body[key]);
    if (err) fields[key] = err;
    else cols[col] = toJsonColumn(body[key]);
  }

  return { cols, fields };
}

async function fetchBySlug(slug) {
  const rows = await query(
    `SELECT sp.*, c.slug AS child_slug
       FROM solution_programs sp LEFT JOIN child_solutions c ON c.id = sp.child_solution_id
      WHERE sp.slug = ? AND sp.delete_status = 0 LIMIT 1`,
    [slug]
  );
  return rows[0] || null;
}

// GET /apis/admin/programs
async function list(req, res) {
  try {
    const conditions = ["sp.delete_status = 0"];
    const params = [];
    if (req.query.childSolution) { conditions.push("c.slug = ?"); params.push(String(req.query.childSolution)); }
    if (req.query.q) {
      const like = `%${String(req.query.q).trim()}%`;
      conditions.push("(sp.title LIKE ? OR sp.slug LIKE ?)");
      params.push(like, like);
    }
    if (req.query.isActive === "true" || req.query.isActive === "false") { conditions.push("sp.is_active = ?"); params.push(req.query.isActive === "true" ? 1 : 0); }
    if (req.query.isPublished === "true" || req.query.isPublished === "false") { conditions.push("sp.is_published = ?"); params.push(req.query.isPublished === "true" ? 1 : 0); }

    const where = `WHERE ${conditions.join(" AND ")}`;
    const { field, dir } = parseSort(req.query, SORT_FIELDS);
    const { page, pageSize, offset } = parsePaging(req.query);

    const countRows = await query(
      `SELECT COUNT(*) AS total FROM solution_programs sp LEFT JOIN child_solutions c ON c.id = sp.child_solution_id ${where}`,
      params
    );
    const total = countRows[0].total;

    const rows = await query(
      `SELECT sp.*, c.slug AS child_slug FROM solution_programs sp LEFT JOIN child_solutions c ON c.id = sp.child_solution_id
        ${where} ORDER BY sp.${field} ${dir}, sp.title ASC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return res.json({ data: rows.map(mapProgram), meta: pageMeta(page, pageSize, total) });
  } catch (err) {
    console.error("[programs] list error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load programs");
  }
}

// GET /apis/admin/child-solutions/:slug/programs
async function listByChild(req, res) {
  try {
    const child = await query(`SELECT id FROM child_solutions WHERE slug = ? AND delete_status = 0 LIMIT 1`, [req.params.slug]);
    if (!child[0]) return sendError(res, 404, "NOT_FOUND", "Child solution not found");
    const rows = await query(
      `SELECT sp.*, c.slug AS child_slug FROM solution_programs sp LEFT JOIN child_solutions c ON c.id = sp.child_solution_id
        WHERE sp.child_solution_id = ? AND sp.delete_status = 0 ORDER BY sp.sort_order ASC, sp.title ASC`,
      [child[0].id]
    );
    return res.json({ data: rows.map(mapProgram) });
  } catch (err) {
    console.error("[programs] listByChild error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load programs");
  }
}

// GET /apis/admin/programs/:slug
async function getOne(req, res) {
  try {
    const row = await fetchBySlug(req.params.slug);
    if (!row) return sendError(res, 404, "NOT_FOUND", "Program not found");
    return res.json({ data: mapProgram(row) });
  } catch (err) {
    console.error("[programs] getOne error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load program");
  }
}

// POST /apis/admin/programs
async function create(req, res) {
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const slug = req.body.slug ? String(req.body.slug).trim().toLowerCase() : slugify(title);

    const { cols, fields } = collectColumns(req.body, { partial: false });
    const layout = collectLayout(req.body);
    Object.assign(cols, layout.cols);
    Object.assign(fields, layout.fields);

    if (!isValidSlug(slug)) fields.slug = "Slug must be kebab-case, ≤120 chars";

    let childId = null;
    if (!req.body.childSolutionSlug) {
      fields.childSolutionSlug = "childSolutionSlug is required";
    } else {
      const child = await query(`SELECT id FROM child_solutions WHERE slug = ? AND delete_status = 0 LIMIT 1`, [String(req.body.childSolutionSlug)]);
      if (!child[0]) fields.childSolutionSlug = "childSolutionSlug does not reference an existing child solution";
      else childId = child[0].id;
    }

    if (Object.keys(fields).length) return sendError(res, 422, "VALIDATION_ERROR", "One or more fields are invalid", fields);

    cols.slug = slug;
    cols.child_solution_id = childId;

    const columns = Object.keys(cols);
    const placeholders = columns.map(() => "?").join(", ");
    let result;
    try {
      result = await query(`INSERT INTO solution_programs (${columns.join(", ")}) VALUES (${placeholders})`, Object.values(cols));
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        // Revive a soft-deleted row holding this slug (hidden from the list).
        const dead = await query(`SELECT id FROM solution_programs WHERE slug = ? AND delete_status = 1 LIMIT 1`, [slug]);
        if (dead[0]) {
          const setClause = columns.map((c) => `${c} = ?`).join(", ");
          await query(`UPDATE solution_programs SET ${setClause}, delete_status = 0 WHERE id = ?`, [...Object.values(cols), dead[0].id]);
          const row = await fetchBySlug(slug);
          return res.status(201).json({ data: mapProgram(row) });
        }
        return sendError(res, 409, "SLUG_CONFLICT", `Slug '${slug}' is already in use`);
      }
      throw err;
    }

    const row = await fetchBySlug(slug);
    return res.status(201).json({ data: mapProgram(row) });
  } catch (err) {
    console.error("[programs] create error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not create program");
  }
}

// PATCH /apis/admin/programs/:slug
async function update(req, res) {
  try {
    const existing = await query(`SELECT id FROM solution_programs WHERE slug = ? AND delete_status = 0 LIMIT 1`, [req.params.slug]);
    if (!existing[0]) return sendError(res, 404, "NOT_FOUND", "Program not found");

    const { cols, fields } = collectColumns(req.body, { partial: true });
    const layout = collectLayout(req.body);
    Object.assign(cols, layout.cols);
    Object.assign(fields, layout.fields);

    if (req.body.slug !== undefined) {
      const slug = String(req.body.slug).trim().toLowerCase();
      if (!isValidSlug(slug)) fields.slug = "Slug must be kebab-case, ≤120 chars";
      else cols.slug = slug;
    }
    if (req.body.childSolutionSlug !== undefined) {
      const child = await query(`SELECT id FROM child_solutions WHERE slug = ? AND delete_status = 0 LIMIT 1`, [String(req.body.childSolutionSlug)]);
      if (!child[0]) fields.childSolutionSlug = "childSolutionSlug does not reference an existing child solution";
      else cols.child_solution_id = child[0].id;
    }

    if (Object.keys(fields).length) return sendError(res, 422, "VALIDATION_ERROR", "One or more fields are invalid", fields);
    if (!Object.keys(cols).length) return sendError(res, 422, "VALIDATION_ERROR", "No updatable fields provided");

    const setClause = Object.keys(cols).map((c) => `${c} = ?`).join(", ");
    try {
      await query(`UPDATE solution_programs SET ${setClause} WHERE id = ?`, [...Object.values(cols), existing[0].id]);
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") return sendError(res, 409, "SLUG_CONFLICT", "Slug is already in use");
      throw err;
    }

    const row = await fetchBySlug(cols.slug || req.params.slug);
    return res.json({ data: mapProgram(row) });
  } catch (err) {
    console.error("[programs] update error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not update program");
  }
}

// DELETE /apis/admin/programs/:slug   (soft delete; no children below programs)
async function remove(req, res) {
  try {
    const rows = await query(`SELECT id FROM solution_programs WHERE slug = ? AND delete_status = 0 LIMIT 1`, [req.params.slug]);
    if (!rows[0]) return sendError(res, 404, "NOT_FOUND", "Program not found");
    await query(`UPDATE solution_programs SET delete_status = 1 WHERE id = ?`, [rows[0].id]);
    return res.json({ data: { slug: req.params.slug, deleted: true } });
  } catch (err) {
    console.error("[programs] delete error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not delete program");
  }
}

// POST /apis/admin/programs/reorder   { order: [slug, ...] }
async function reorder(req, res) {
  try {
    const order = req.body.order;
    if (!Array.isArray(order) || !order.length) return sendError(res, 422, "VALIDATION_ERROR", "Body must be { order: [slug, ...] }");
    await withTransaction(async (tx) => {
      for (let i = 0; i < order.length; i++) {
        await tx.query(`UPDATE solution_programs SET sort_order = ? WHERE slug = ? AND delete_status = 0`, [i, String(order[i])]);
      }
    });
    return res.json({ data: { reordered: order.length } });
  } catch (err) {
    console.error("[programs] reorder error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not reorder programs");
  }
}

module.exports = { list, listByChild, getOne, create, update, remove, reorder, mapProgram };
