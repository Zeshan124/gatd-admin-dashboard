const { query, withTransaction } = require("../config/db");
const { slugify, isValidSlug } = require("../utils/slug");
const { parseJson, toJsonColumn } = require("../utils/json");
const { parsePaging, parseSort, pageMeta } = require("../utils/listQuery");
const { sendError } = require("../utils/http");

const SORT_FIELDS = { sort_order: "sort_order", title: "title", rating: "rating", created_at: "created_at" };

// Optional plain-string columns: [column, bodyKey]
const STRING_FIELDS = [
  ["eyebrow", "eyebrow"], ["subheading", "subheading"], ["subtext", "subtext"],
  ["banner", "banner"], ["card_image", "cardImage"], ["programmes_heading", "programmesHeading"],
  ["map_image", "mapImage"], ["gains_heading", "gainsHeading"], ["why_heading", "whyHeading"],
  ["why_badge", "whyBadge"], ["why_image", "whyImage"], ["audience_badge", "audienceBadge"],
  ["audience_heading", "audienceHeading"], ["audience_image", "audienceImage"], ["brochure", "brochure"],
];

// A link target is safe only if it's a same-site relative path (/…, not //) or an
// http(s) absolute URL — this blocks javascript:/data:/vbscript: XSS in the href.
const SAFE_LINK_RE = /^(https?:\/\/|\/(?!\/))/i;

const PROGRAM_COUNT_SUBQ =
  "(SELECT COUNT(*) FROM solution_programs sp WHERE sp.child_solution_id = c.id AND sp.delete_status = 0) AS program_count";

function mapChild(r) {
  return {
    id: r.id,
    parentSolutionId: r.parent_solution_id,
    parentSlug: r.parent_slug,
    slug: r.slug,
    eyebrow: r.eyebrow,
    title: r.title,
    description: r.description,
    subheading: r.subheading,
    subtext: r.subtext,
    banner: r.banner,
    cardImage: r.card_image,
    programmesHeading: r.programmes_heading,
    mapImage: r.map_image,
    gainsHeading: r.gains_heading,
    gains: parseJson(r.gains),
    whyHeading: r.why_heading,
    whyBadge: r.why_badge,
    whyImage: r.why_image,
    audienceBadge: r.audience_badge,
    audienceHeading: r.audience_heading,
    audienceImage: r.audience_image,
    audience: parseJson(r.audience),
    brochure: r.brochure,
    isClickable: !!r.is_clickable,
    linkUrl: r.link_url,
    rating: r.rating != null ? Number(r.rating) : null,
    reviews: r.reviews,
    isActive: !!r.is_active,
    sortOrder: r.sort_order,
    programCount: r.program_count,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// --- validation helpers ----------------------------------------------------

function validateGains(gains) {
  if (!Array.isArray(gains)) return "gains must be an array";
  for (const g of gains) {
    if (!g || typeof g !== "object") return "each gain must be an object";
    if (typeof g.text !== "string" || !g.text.trim() || g.text.length > 300) return "each gain needs text (≤300 chars)";
    if (g.iconSrc != null && typeof g.iconSrc !== "string") return "gain iconSrc must be a string";
  }
  return null;
}

function validateStringArray(arr, name) {
  if (!Array.isArray(arr)) return `${name} must be an array`;
  if (!arr.every((s) => typeof s === "string" && s.trim())) return `${name} must contain non-empty strings`;
  return null;
}

function validateRating(v) {
  const n = Number(v);
  if (Number.isNaN(n) || n < 0 || n > 5) return null_error("rating must be between 0.0 and 5.0");
  return { value: Math.round(n * 10) / 10 };
}
function null_error(msg) { return { error: msg }; }

/** Collect column values shared by create & update. Returns { cols, fields }. */
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
  if (body.gains !== undefined) {
    const err = validateGains(body.gains);
    if (err) fields.gains = err;
    else cols.gains = toJsonColumn(body.gains);
  }
  if (body.audience !== undefined) {
    const err = validateStringArray(body.audience, "audience");
    if (err) fields.audience = err;
    else cols.audience = toJsonColumn(body.audience);
  }
  if (body.rating !== undefined) {
    const r = validateRating(body.rating);
    if (r.error) fields.rating = r.error;
    else cols.rating = r.value;
  }
  if (body.reviews !== undefined) {
    const n = parseInt(body.reviews, 10);
    if (Number.isNaN(n) || n < 0) fields.reviews = "reviews must be an integer ≥ 0";
    else cols.reviews = n;
  }
  if (body.isActive !== undefined) cols.is_active = body.isActive ? 1 : 0;
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
  return { cols, fields };
}

async function fetchBySlug(slug) {
  const rows = await query(
    `SELECT c.*, p.slug AS parent_slug, ${PROGRAM_COUNT_SUBQ}
       FROM child_solutions c LEFT JOIN parent_solutions p ON p.id = c.parent_solution_id
      WHERE c.slug = ? AND c.delete_status = 0 LIMIT 1`,
    [slug]
  );
  return rows[0] || null;
}

// GET /apis/admin/child-solutions
async function list(req, res) {
  try {
    const conditions = ["c.delete_status = 0"];
    const params = [];

    if (req.query.parent) {
      conditions.push("p.slug = ?");
      params.push(String(req.query.parent));
    }
    if (req.query.q) {
      const like = `%${String(req.query.q).trim()}%`;
      conditions.push("(c.title LIKE ? OR c.slug LIKE ?)");
      params.push(like, like);
    }
    if (req.query.isActive === "true" || req.query.isActive === "false") {
      conditions.push("c.is_active = ?");
      params.push(req.query.isActive === "true" ? 1 : 0);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;
    const { field, dir } = parseSort(req.query, SORT_FIELDS);
    const { page, pageSize, offset } = parsePaging(req.query);

    const countRows = await query(
      `SELECT COUNT(*) AS total FROM child_solutions c LEFT JOIN parent_solutions p ON p.id = c.parent_solution_id ${where}`,
      params
    );
    const total = countRows[0].total;

    const rows = await query(
      `SELECT c.*, p.slug AS parent_slug, ${PROGRAM_COUNT_SUBQ}
         FROM child_solutions c LEFT JOIN parent_solutions p ON p.id = c.parent_solution_id
        ${where} ORDER BY c.${field} ${dir}, c.title ASC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return res.json({ data: rows.map(mapChild), meta: pageMeta(page, pageSize, total) });
  } catch (err) {
    console.error("[child-solutions] list error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load child solutions");
  }
}

// GET /apis/admin/parent-solutions/:slug/children
async function listByParent(req, res) {
  try {
    const parent = await query(`SELECT id FROM parent_solutions WHERE slug = ? AND delete_status = 0 LIMIT 1`, [req.params.slug]);
    if (!parent[0]) return sendError(res, 404, "NOT_FOUND", "Parent solution not found");

    const rows = await query(
      `SELECT c.*, p.slug AS parent_slug, ${PROGRAM_COUNT_SUBQ}
         FROM child_solutions c LEFT JOIN parent_solutions p ON p.id = c.parent_solution_id
        WHERE c.parent_solution_id = ? AND c.delete_status = 0
        ORDER BY c.sort_order ASC, c.title ASC`,
      [parent[0].id]
    );
    return res.json({ data: rows.map(mapChild) });
  } catch (err) {
    console.error("[child-solutions] listByParent error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load children");
  }
}

/** Build the programmes projection for a child (used by getOne + public). */
async function programmesProjection(childId, childSlug, { publishedOnly = false, activeOnly = false } = {}) {
  const conds = ["child_solution_id = ?", "delete_status = 0"];
  const params = [childId];
  if (activeOnly) conds.push("is_active = 1");
  if (publishedOnly) conds.push("is_published = 1");
  const rows = await query(
    `SELECT slug, title, description, card_image, rating, reviews, is_published, is_clickable, link_url
       FROM solution_programs WHERE ${conds.join(" AND ")} ORDER BY sort_order ASC, title ASC`,
    params
  );
  return rows.map((p) => {
    // Admin-controlled clickability. Its own page only exists when published, so
    // fall back to that only if published; a custom link_url works regardless.
    const ownPage = p.is_published ? `/solutions/${childSlug}/${p.slug}` : null;
    const href = p.is_clickable ? (p.link_url || ownPage) : null;
    return {
      slug: p.slug,
      title: p.title,
      description: p.description,
      image: p.card_image,
      rating: p.rating != null ? Number(p.rating) : null,
      reviews: p.reviews,
      isPublished: !!p.is_published,
      href, // null → non-clickable card
    };
  });
}

// GET /apis/admin/child-solutions/:slug  (full record + programmes projection)
async function getOne(req, res) {
  try {
    const row = await fetchBySlug(req.params.slug);
    if (!row) return sendError(res, 404, "NOT_FOUND", "Child solution not found");
    const data = mapChild(row);
    data.programmes = await programmesProjection(row.id, row.slug);
    return res.json({ data });
  } catch (err) {
    console.error("[child-solutions] getOne error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load child solution");
  }
}

// POST /apis/admin/child-solutions
async function create(req, res) {
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const slug = req.body.slug ? String(req.body.slug).trim().toLowerCase() : slugify(title);

    const { cols, fields } = collectColumns(req.body, { partial: false });
    if (!isValidSlug(slug)) fields.slug = "Slug must be kebab-case, ≤120 chars";

    // Resolve parent
    let parentId = null;
    if (!req.body.parentSlug) {
      fields.parentSlug = "parentSlug is required";
    } else {
      const parent = await query(`SELECT id FROM parent_solutions WHERE slug = ? AND delete_status = 0 LIMIT 1`, [String(req.body.parentSlug)]);
      if (!parent[0]) fields.parentSlug = "parentSlug does not reference an existing parent solution";
      else parentId = parent[0].id;
    }

    if (Object.keys(fields).length) return sendError(res, 422, "VALIDATION_ERROR", "One or more fields are invalid", fields);

    cols.slug = slug;
    cols.parent_solution_id = parentId;

    const columns = Object.keys(cols);
    const placeholders = columns.map(() => "?").join(", ");
    let result;
    try {
      result = await query(`INSERT INTO child_solutions (${columns.join(", ")}) VALUES (${placeholders})`, Object.values(cols));
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        // Revive a soft-deleted row holding this slug (hidden from the list).
        const dead = await query(`SELECT id FROM child_solutions WHERE slug = ? AND delete_status = 1 LIMIT 1`, [slug]);
        if (dead[0]) {
          const setClause = columns.map((c) => `${c} = ?`).join(", ");
          await query(`UPDATE child_solutions SET ${setClause}, delete_status = 0 WHERE id = ?`, [...Object.values(cols), dead[0].id]);
          const row = await fetchBySlug(slug);
          return res.status(201).json({ data: mapChild(row) });
        }
        return sendError(res, 409, "SLUG_CONFLICT", `Slug '${slug}' is already in use`);
      }
      throw err;
    }

    const row = await fetchBySlug(slug);
    return res.status(201).json({ data: mapChild(row) });
  } catch (err) {
    console.error("[child-solutions] create error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not create child solution");
  }
}

// PATCH /apis/admin/child-solutions/:slug
async function update(req, res) {
  try {
    const existing = await query(`SELECT id FROM child_solutions WHERE slug = ? AND delete_status = 0 LIMIT 1`, [req.params.slug]);
    if (!existing[0]) return sendError(res, 404, "NOT_FOUND", "Child solution not found");

    const { cols, fields } = collectColumns(req.body, { partial: true });

    if (req.body.slug !== undefined) {
      const slug = String(req.body.slug).trim().toLowerCase();
      if (!isValidSlug(slug)) fields.slug = "Slug must be kebab-case, ≤120 chars";
      else cols.slug = slug;
    }
    if (req.body.parentSlug !== undefined) {
      const parent = await query(`SELECT id FROM parent_solutions WHERE slug = ? AND delete_status = 0 LIMIT 1`, [String(req.body.parentSlug)]);
      if (!parent[0]) fields.parentSlug = "parentSlug does not reference an existing parent solution";
      else cols.parent_solution_id = parent[0].id;
    }

    if (Object.keys(fields).length) return sendError(res, 422, "VALIDATION_ERROR", "One or more fields are invalid", fields);
    if (!Object.keys(cols).length) return sendError(res, 422, "VALIDATION_ERROR", "No updatable fields provided");

    const setClause = Object.keys(cols).map((c) => `${c} = ?`).join(", ");
    try {
      await query(`UPDATE child_solutions SET ${setClause} WHERE id = ?`, [...Object.values(cols), existing[0].id]);
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") return sendError(res, 409, "SLUG_CONFLICT", "Slug is already in use");
      throw err;
    }

    const row = await fetchBySlug(cols.slug || req.params.slug);
    return res.json({ data: mapChild(row) });
  } catch (err) {
    console.error("[child-solutions] update error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not update child solution");
  }
}

// DELETE /apis/admin/child-solutions/:slug   (?cascade=true to soft-delete its programs)
async function remove(req, res) {
  try {
    const rows = await query(`SELECT id FROM child_solutions WHERE slug = ? AND delete_status = 0 LIMIT 1`, [req.params.slug]);
    if (!rows[0]) return sendError(res, 404, "NOT_FOUND", "Child solution not found");
    const childId = rows[0].id;

    const progRows = await query(`SELECT COUNT(*) AS n FROM solution_programs WHERE child_solution_id = ? AND delete_status = 0`, [childId]);
    const activePrograms = progRows[0].n;
    const cascade = String(req.query.cascade) === "true";

    if (activePrograms > 0 && !cascade) {
      return sendError(res, 409, "HAS_PROGRAMS", `Child has ${activePrograms} active program(s). Pass ?cascade=true to delete them too.`);
    }

    await withTransaction(async (tx) => {
      if (cascade && activePrograms > 0) {
        await tx.query(`UPDATE solution_programs SET delete_status = 1 WHERE child_solution_id = ?`, [childId]);
      }
      await tx.query(`UPDATE child_solutions SET delete_status = 1 WHERE id = ?`, [childId]);
    });

    return res.json({ data: { slug: req.params.slug, deleted: true, cascadedPrograms: cascade ? activePrograms : 0 } });
  } catch (err) {
    console.error("[child-solutions] delete error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not delete child solution");
  }
}

// POST /apis/admin/child-solutions/reorder   { order: [slug, ...] }
async function reorder(req, res) {
  try {
    const order = req.body.order;
    if (!Array.isArray(order) || !order.length) return sendError(res, 422, "VALIDATION_ERROR", "Body must be { order: [slug, ...] }");
    await withTransaction(async (tx) => {
      for (let i = 0; i < order.length; i++) {
        await tx.query(`UPDATE child_solutions SET sort_order = ? WHERE slug = ? AND delete_status = 0`, [i, String(order[i])]);
      }
    });
    return res.json({ data: { reordered: order.length } });
  } catch (err) {
    console.error("[child-solutions] reorder error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not reorder child solutions");
  }
}

module.exports = { list, listByParent, getOne, create, update, remove, reorder, programmesProjection, mapChild };
