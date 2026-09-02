const { query, withTransaction } = require("../config/db");
const { slugify, isValidSlug } = require("../utils/slug");
const { parseJson, toJsonColumn } = require("../utils/json");
const { parsePaging, parseSort, pageMeta } = require("../utils/listQuery");
const { sendError } = require("../utils/http");

const SORT_FIELDS = {
  published_at: "published_at",
  title: "title",
  created_at: "created_at",
  sort_order: "sort_order",
};

// Optional plain-string columns: [column, bodyKey]
const STRING_FIELDS = [
  ["excerpt", "excerpt"],
  ["cover_image", "coverImage"],
  ["author_name", "authorName"],
  ["author_image", "authorImage"],
  ["category", "category"],
  ["meta_title", "metaTitle"],
  ["meta_description", "metaDescription"],
];

function mapBlog(r) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    content: r.content,
    coverImage: r.cover_image,
    authorName: r.author_name,
    authorImage: r.author_image,
    category: r.category,
    tags: parseJson(r.tags),
    readMinutes: r.read_minutes,
    views: r.views,
    metaTitle: r.meta_title,
    metaDescription: r.meta_description,
    isFeatured: !!r.is_featured,
    isPublished: !!r.is_published,
    publishedAt: r.published_at,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// A lighter shape for list/card views (no full content body).
function mapBlogCard(r) {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    coverImage: r.cover_image,
    authorName: r.author_name,
    authorImage: r.author_image,
    category: r.category,
    tags: parseJson(r.tags),
    readMinutes: r.read_minutes,
    views: r.views,
    isFeatured: !!r.is_featured,
    publishedAt: r.published_at,
  };
}

function validateTags(v) {
  if (!Array.isArray(v)) return "tags must be an array";
  if (!v.every((s) => typeof s === "string" && s.trim() && s.length <= 60))
    return "each tag must be a non-empty string (≤60 chars)";
  return null;
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
  if (body.content !== undefined || !partial) {
    const content = body.content == null ? "" : String(body.content);
    if (!content.trim()) fields.content = "Content is required";
    else cols.content = content;
  }
  for (const [col, key] of STRING_FIELDS) {
    if (body[key] !== undefined) cols[col] = body[key] == null ? null : String(body[key]);
  }
  if (body.tags !== undefined) {
    if (body.tags === null) cols.tags = null;
    else {
      const err = validateTags(body.tags);
      if (err) fields.tags = err;
      else cols.tags = toJsonColumn(body.tags);
    }
  }
  if (body.readMinutes !== undefined) {
    if (body.readMinutes === null || body.readMinutes === "") cols.read_minutes = null;
    else {
      const n = parseInt(body.readMinutes, 10);
      if (Number.isNaN(n) || n < 0) fields.readMinutes = "readMinutes must be an integer ≥ 0";
      else cols.read_minutes = n;
    }
  }
  if (body.views !== undefined) {
    if (body.views === null || body.views === "") cols.views = 0;
    else {
      const n = parseInt(body.views, 10);
      if (Number.isNaN(n) || n < 0) fields.views = "views must be an integer ≥ 0";
      else cols.views = n;
    }
  }
  if (body.isFeatured !== undefined) cols.is_featured = body.isFeatured ? 1 : 0;
  if (body.isPublished !== undefined) cols.is_published = body.isPublished ? 1 : 0;
  if (body.sortOrder !== undefined) {
    const n = parseInt(body.sortOrder, 10);
    if (Number.isNaN(n) || n < 0) fields.sortOrder = "sortOrder must be an integer ≥ 0";
    else cols.sort_order = n;
  }
  if (body.publishedAt !== undefined) {
    if (body.publishedAt === null || body.publishedAt === "") cols.published_at = null;
    else {
      const d = new Date(body.publishedAt);
      if (isNaN(d.getTime())) fields.publishedAt = "publishedAt must be a valid date";
      else cols.published_at = d;
    }
  }
  return { cols, fields };
}

async function fetchBySlug(slug) {
  const rows = await query(`SELECT * FROM blogs WHERE slug = ? AND delete_status = 0 LIMIT 1`, [slug]);
  return rows[0] || null;
}

// ── Admin ────────────────────────────────────────────────────────────────────

// GET /apis/admin/blogs
async function list(req, res) {
  try {
    const conditions = ["delete_status = 0"];
    const params = [];
    if (req.query.q) {
      const like = `%${String(req.query.q).trim()}%`;
      conditions.push("(title LIKE ? OR slug LIKE ? OR category LIKE ?)");
      params.push(like, like, like);
    }
    if (req.query.category) {
      conditions.push("category = ?");
      params.push(String(req.query.category));
    }
    if (req.query.isPublished === "true" || req.query.isPublished === "false") {
      conditions.push("is_published = ?");
      params.push(req.query.isPublished === "true" ? 1 : 0);
    }
    if (req.query.isFeatured === "true" || req.query.isFeatured === "false") {
      conditions.push("is_featured = ?");
      params.push(req.query.isFeatured === "true" ? 1 : 0);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;
    const { field, dir } = parseSort(req.query, SORT_FIELDS, "published_at");
    const { page, pageSize, offset } = parsePaging(req.query);

    const countRows = await query(`SELECT COUNT(*) AS total FROM blogs ${where}`, params);
    const total = countRows[0].total;

    const rows = await query(
      `SELECT * FROM blogs ${where} ORDER BY ${field} ${dir}, id DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    return res.json({ data: rows.map(mapBlog), meta: pageMeta(page, pageSize, total) });
  } catch (err) {
    console.error("[blogs] list error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load blogs");
  }
}

// GET /apis/admin/blogs/:slug
async function getOne(req, res) {
  try {
    const row = await fetchBySlug(req.params.slug);
    if (!row) return sendError(res, 404, "NOT_FOUND", "Blog post not found");
    return res.json({ data: mapBlog(row) });
  } catch (err) {
    console.error("[blogs] getOne error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load blog post");
  }
}

// POST /apis/admin/blogs
async function create(req, res) {
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const slug = req.body.slug ? String(req.body.slug).trim().toLowerCase() : slugify(title);

    const { cols, fields } = collectColumns(req.body, { partial: false });
    if (!isValidSlug(slug)) fields.slug = "Slug must be kebab-case, ≤120 chars";
    if (Object.keys(fields).length) return sendError(res, 422, "VALIDATION_ERROR", "One or more fields are invalid", fields);

    cols.slug = slug;
    // A published post with no explicit date gets stamped now.
    const willPublish = "is_published" in cols ? cols.is_published : 1;
    if (willPublish && !("published_at" in cols)) cols.published_at = new Date();

    const columns = Object.keys(cols);
    const placeholders = columns.map(() => "?").join(", ");
    try {
      await query(`INSERT INTO blogs (${columns.join(", ")}) VALUES (${placeholders})`, Object.values(cols));
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") return sendError(res, 409, "SLUG_CONFLICT", `Slug '${slug}' is already in use`);
      throw err;
    }

    const row = await fetchBySlug(slug);
    return res.status(201).json({ data: mapBlog(row) });
  } catch (err) {
    console.error("[blogs] create error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not create blog post");
  }
}

// PATCH /apis/admin/blogs/:slug
async function update(req, res) {
  try {
    const existing = await fetchBySlug(req.params.slug);
    if (!existing) return sendError(res, 404, "NOT_FOUND", "Blog post not found");

    const { cols, fields } = collectColumns(req.body, { partial: true });
    if (req.body.slug !== undefined) {
      const slug = String(req.body.slug).trim().toLowerCase();
      if (!isValidSlug(slug)) fields.slug = "Slug must be kebab-case, ≤120 chars";
      else cols.slug = slug;
    }
    if (Object.keys(fields).length) return sendError(res, 422, "VALIDATION_ERROR", "One or more fields are invalid", fields);
    if (!Object.keys(cols).length) return sendError(res, 422, "VALIDATION_ERROR", "No updatable fields provided");

    // First time a post is published, stamp published_at if not set.
    if (cols.is_published === 1 && !("published_at" in cols) && existing.published_at == null) {
      cols.published_at = new Date();
    }

    const setClause = Object.keys(cols).map((c) => `${c} = ?`).join(", ");
    try {
      await query(`UPDATE blogs SET ${setClause} WHERE id = ?`, [...Object.values(cols), existing.id]);
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") return sendError(res, 409, "SLUG_CONFLICT", "Slug is already in use");
      throw err;
    }

    const row = await fetchBySlug(cols.slug || req.params.slug);
    return res.json({ data: mapBlog(row) });
  } catch (err) {
    console.error("[blogs] update error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not update blog post");
  }
}

// DELETE /apis/admin/blogs/:slug  (soft delete)
async function remove(req, res) {
  try {
    const rows = await query(`SELECT id FROM blogs WHERE slug = ? AND delete_status = 0 LIMIT 1`, [req.params.slug]);
    if (!rows[0]) return sendError(res, 404, "NOT_FOUND", "Blog post not found");
    await query(`UPDATE blogs SET delete_status = 1 WHERE id = ?`, [rows[0].id]);
    return res.json({ data: { slug: req.params.slug, deleted: true } });
  } catch (err) {
    console.error("[blogs] delete error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not delete blog post");
  }
}

// POST /apis/admin/blogs/reorder   { order: [slug, ...] }
async function reorder(req, res) {
  try {
    const order = req.body.order;
    if (!Array.isArray(order) || !order.length) return sendError(res, 422, "VALIDATION_ERROR", "Body must be { order: [slug, ...] }");
    await withTransaction(async (tx) => {
      for (let i = 0; i < order.length; i++) {
        await tx.query(`UPDATE blogs SET sort_order = ? WHERE slug = ? AND delete_status = 0`, [i, String(order[i])]);
      }
    });
    return res.json({ data: { reordered: order.length } });
  } catch (err) {
    console.error("[blogs] reorder error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not reorder blogs");
  }
}

// ── Public (published only) ──────────────────────────────────────────────────

// GET /apis/public/blogs
async function listPublic(req, res) {
  try {
    const conditions = ["is_published = 1", "delete_status = 0"];
    const params = [];
    if (req.query.q) {
      const like = `%${String(req.query.q).trim()}%`;
      conditions.push("(title LIKE ? OR excerpt LIKE ?)");
      params.push(like, like);
    }
    if (req.query.category) {
      conditions.push("category = ?");
      params.push(String(req.query.category));
    }
    if (req.query.featured === "true") conditions.push("is_featured = 1");

    const where = `WHERE ${conditions.join(" AND ")}`;
    const { page, pageSize, offset } = parsePaging(req.query);

    const countRows = await query(`SELECT COUNT(*) AS total FROM blogs ${where}`, params);
    const total = countRows[0].total;

    const rows = await query(
      `SELECT slug, title, excerpt, cover_image, author_name, author_image, category, tags, read_minutes, views, is_featured, published_at
         FROM blogs ${where}
        ORDER BY published_at DESC, created_at DESC, id DESC
        LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    return res.json({ data: rows.map(mapBlogCard), meta: pageMeta(page, pageSize, total) });
  } catch (err) {
    console.error("[blogs] listPublic error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load blogs");
  }
}

// GET /apis/public/blogs/slugs  — lightweight list of published slugs (for static generation)
async function publicSlugs(req, res) {
  try {
    const rows = await query(
      `SELECT slug FROM blogs WHERE is_published = 1 AND delete_status = 0 ORDER BY published_at DESC`
    );
    return res.json({ data: rows.map((r) => r.slug) });
  } catch (err) {
    console.error("[blogs] publicSlugs error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load slugs");
  }
}

// GET /apis/public/blogs/:slug  — one published post (full content)
async function getPublicBySlug(req, res) {
  try {
    const rows = await query(
      `SELECT * FROM blogs WHERE slug = ? AND is_published = 1 AND delete_status = 0 LIMIT 1`,
      [req.params.slug]
    );
    if (!rows[0]) return sendError(res, 404, "NOT_FOUND", "Blog post not found");
    const { id, sortOrder, isPublished, isFeatured, ...rest } = mapBlog(rows[0]);
    return res.json({ data: { ...rest, isFeatured } });
  } catch (err) {
    console.error("[blogs] getPublicBySlug error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load blog post");
  }
}

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
  reorder,
  listPublic,
  publicSlugs,
  getPublicBySlug,
};
