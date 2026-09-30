const { query, withTransaction } = require("../config/db");
const { slugify, isValidSlug } = require("../utils/slug");
const { parsePaging, parseSort, pageMeta } = require("../utils/listQuery");
const { sendError } = require("../utils/http");

const SORT_FIELDS = { sort_order: "sort_order", title: "title", created_at: "created_at" };

// Optional string columns for the individual Solution page (hero + middle section).
const STRING_FIELDS = [
  ["eyebrow", "eyebrow"], ["banner", "banner"], ["middle_image", "middleImage"],
  ["middle_badge", "middleBadge"], ["middle_heading", "middleHeading"], ["middle_body", "middleBody"],
];

function mapParent(r) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    eyebrow: r.eyebrow,
    banner: r.banner,
    middleImage: r.middle_image,
    middleBadge: r.middle_badge,
    middleHeading: r.middle_heading,
    middleBody: r.middle_body,
    isClickable: r.is_clickable == null ? true : !!r.is_clickable,
    isActive: !!r.is_active,
    sortOrder: r.sort_order,
    childCount: r.child_count != null ? r.child_count : undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const CHILD_COUNT_SUBQ =
  "(SELECT COUNT(*) FROM child_solutions c WHERE c.parent_solution_id = p.id AND c.delete_status = 0) AS child_count";

// GET /apis/admin/parent-solutions
async function list(req, res) {
  try {
    const conditions = ["p.delete_status = 0"];
    const params = [];

    if (req.query.q) {
      const like = `%${String(req.query.q).trim()}%`;
      conditions.push("(p.title LIKE ? OR p.slug LIKE ?)");
      params.push(like, like);
    }
    if (req.query.isActive === "true" || req.query.isActive === "false") {
      conditions.push("p.is_active = ?");
      params.push(req.query.isActive === "true" ? 1 : 0);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;
    const { field, dir } = parseSort(req.query, SORT_FIELDS);
    const { page, pageSize, offset } = parsePaging(req.query);

    const countRows = await query(`SELECT COUNT(*) AS total FROM parent_solutions p ${where}`, params);
    const total = countRows[0].total;

    const rows = await query(
      `SELECT p.*, ${CHILD_COUNT_SUBQ} FROM parent_solutions p ${where}
        ORDER BY p.${field} ${dir}, p.title ASC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return res.json({ data: rows.map(mapParent), meta: pageMeta(page, pageSize, total) });
  } catch (err) {
    console.error("[parent-solutions] list error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load parent solutions");
  }
}

// GET /apis/admin/parent-solutions/:slug
async function getOne(req, res) {
  try {
    const rows = await query(
      `SELECT p.*, ${CHILD_COUNT_SUBQ} FROM parent_solutions p WHERE p.slug = ? AND p.delete_status = 0 LIMIT 1`,
      [req.params.slug]
    );
    if (!rows[0]) return sendError(res, 404, "NOT_FOUND", "Parent solution not found");
    return res.json({ data: mapParent(rows[0]) });
  } catch (err) {
    console.error("[parent-solutions] getOne error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load parent solution");
  }
}

// POST /apis/admin/parent-solutions
async function create(req, res) {
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const slug = req.body.slug ? String(req.body.slug).trim().toLowerCase() : slugify(title);

    const fields = {};
    if (!title || title.length < 2 || title.length > 255) fields.title = "Title is required (2–255 chars)";
    if (!isValidSlug(slug)) fields.slug = "Slug must be kebab-case (a-z, 0-9, hyphens), ≤120 chars";
    const sortOrder = req.body.sortOrder != null ? parseInt(req.body.sortOrder, 10) : 0;
    if (Number.isNaN(sortOrder) || sortOrder < 0) fields.sortOrder = "sortOrder must be an integer ≥ 0";
    if (Object.keys(fields).length) return sendError(res, 422, "VALIDATION_ERROR", "One or more fields are invalid", fields);

    const isActive = req.body.isActive === undefined ? 1 : req.body.isActive ? 1 : 0;
    const description = req.body.description != null ? String(req.body.description) : null;

    // Base columns + any optional Solution-page fields (hero/middle section) provided.
    const cols = { slug, title, description, is_active: isActive, sort_order: sortOrder };
    for (const [col, key] of STRING_FIELDS) {
      if (req.body[key] !== undefined) cols[col] = req.body[key] == null ? null : String(req.body[key]);
    }
    if (req.body.isClickable !== undefined) cols.is_clickable = req.body.isClickable ? 1 : 0;
    const colNames = Object.keys(cols);
    const placeholders = colNames.map(() => "?").join(", ");

    let result;
    try {
      result = await query(
        `INSERT INTO parent_solutions (${colNames.join(", ")}) VALUES (${placeholders})`,
        Object.values(cols)
      );
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        // The slug is held by an existing row. If it was soft-deleted (hidden
        // from the list), revive it with the new values — the intuitive result
        // for the admin, who can't see the deleted record.
        const dead = await query(
          `SELECT id FROM parent_solutions WHERE slug = ? AND delete_status = 1 LIMIT 1`,
          [slug]
        );
        if (dead[0]) {
          const reviveCols = { ...cols, delete_status: 0 };
          delete reviveCols.slug; // keep the existing slug
          const setClause = Object.keys(reviveCols).map((c) => `${c} = ?`).join(", ");
          await query(`UPDATE parent_solutions SET ${setClause} WHERE id = ?`, [...Object.values(reviveCols), dead[0].id]);
          const revived = await query(`SELECT p.*, ${CHILD_COUNT_SUBQ} FROM parent_solutions p WHERE p.id = ?`, [dead[0].id]);
          return res.status(201).json({ data: mapParent(revived[0]) });
        }
        return sendError(res, 409, "SLUG_CONFLICT", `Slug '${slug}' is already in use`);
      }
      throw err;
    }

    const rows = await query(
      `SELECT p.*, ${CHILD_COUNT_SUBQ} FROM parent_solutions p WHERE p.id = ?`,
      [result.insertId]
    );
    return res.status(201).json({ data: mapParent(rows[0]) });
  } catch (err) {
    console.error("[parent-solutions] create error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not create parent solution");
  }
}

// PATCH /apis/admin/parent-solutions/:slug
async function update(req, res) {
  try {
    const existing = await query(`SELECT * FROM parent_solutions WHERE slug = ? AND delete_status = 0 LIMIT 1`, [req.params.slug]);
    if (!existing[0]) return sendError(res, 404, "NOT_FOUND", "Parent solution not found");

    const sets = [];
    const params = [];
    const fields = {};

    if (req.body.title !== undefined) {
      const title = String(req.body.title).trim();
      if (title.length < 2 || title.length > 255) fields.title = "Title must be 2–255 chars";
      else { sets.push("title = ?"); params.push(title); }
    }
    if (req.body.slug !== undefined) {
      const slug = String(req.body.slug).trim().toLowerCase();
      if (!isValidSlug(slug)) fields.slug = "Slug must be kebab-case, ≤120 chars";
      else { sets.push("slug = ?"); params.push(slug); }
    }
    if (req.body.description !== undefined) { sets.push("description = ?"); params.push(req.body.description == null ? null : String(req.body.description)); }
    for (const [col, key] of STRING_FIELDS) {
      if (req.body[key] !== undefined) { sets.push(`${col} = ?`); params.push(req.body[key] == null ? null : String(req.body[key])); }
    }
    if (req.body.isClickable !== undefined) { sets.push("is_clickable = ?"); params.push(req.body.isClickable ? 1 : 0); }
    if (req.body.isActive !== undefined) { sets.push("is_active = ?"); params.push(req.body.isActive ? 1 : 0); }
    if (req.body.sortOrder !== undefined) {
      const so = parseInt(req.body.sortOrder, 10);
      if (Number.isNaN(so) || so < 0) fields.sortOrder = "sortOrder must be an integer ≥ 0";
      else { sets.push("sort_order = ?"); params.push(so); }
    }

    if (Object.keys(fields).length) return sendError(res, 422, "VALIDATION_ERROR", "One or more fields are invalid", fields);
    if (!sets.length) return sendError(res, 422, "VALIDATION_ERROR", "No updatable fields provided");

    params.push(existing[0].id);
    try {
      await query(`UPDATE parent_solutions SET ${sets.join(", ")} WHERE id = ?`, params);
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") return sendError(res, 409, "SLUG_CONFLICT", "Slug is already in use");
      throw err;
    }

    const rows = await query(`SELECT p.*, ${CHILD_COUNT_SUBQ} FROM parent_solutions p WHERE p.id = ?`, [existing[0].id]);
    return res.json({ data: mapParent(rows[0]) });
  } catch (err) {
    console.error("[parent-solutions] update error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not update parent solution");
  }
}

// DELETE /apis/admin/parent-solutions/:slug   (?cascade=true to also soft-delete descendants)
async function remove(req, res) {
  try {
    const rows = await query(`SELECT * FROM parent_solutions WHERE slug = ? AND delete_status = 0 LIMIT 1`, [req.params.slug]);
    if (!rows[0]) return sendError(res, 404, "NOT_FOUND", "Parent solution not found");
    const parentId = rows[0].id;

    const childRows = await query(`SELECT COUNT(*) AS n FROM child_solutions WHERE parent_solution_id = ? AND delete_status = 0`, [parentId]);
    const activeChildren = childRows[0].n;
    const cascade = String(req.query.cascade) === "true";

    if (activeChildren > 0 && !cascade) {
      return sendError(res, 409, "HAS_CHILDREN", `Parent has ${activeChildren} active child solution(s). Pass ?cascade=true to delete them too.`);
    }

    await withTransaction(async (tx) => {
      if (cascade && activeChildren > 0) {
        await tx.query(
          `UPDATE solution_programs SET delete_status = 1
            WHERE child_solution_id IN (SELECT id FROM child_solutions WHERE parent_solution_id = ?)`,
          [parentId]
        );
        await tx.query(`UPDATE child_solutions SET delete_status = 1 WHERE parent_solution_id = ?`, [parentId]);
      }
      await tx.query(`UPDATE parent_solutions SET delete_status = 1 WHERE id = ?`, [parentId]);
    });

    return res.json({ data: { slug: req.params.slug, deleted: true, cascadedChildren: cascade ? activeChildren : 0 } });
  } catch (err) {
    console.error("[parent-solutions] delete error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not delete parent solution");
  }
}

// POST /apis/admin/parent-solutions/reorder   { order: ["slug-a", "slug-b", ...] }
async function reorder(req, res) {
  try {
    const order = req.body.order;
    if (!Array.isArray(order) || !order.length) return sendError(res, 422, "VALIDATION_ERROR", "Body must be { order: [slug, ...] }");

    await withTransaction(async (tx) => {
      for (let i = 0; i < order.length; i++) {
        await tx.query(`UPDATE parent_solutions SET sort_order = ? WHERE slug = ? AND delete_status = 0`, [i, String(order[i])]);
      }
    });
    return res.json({ data: { reordered: order.length } });
  } catch (err) {
    console.error("[parent-solutions] reorder error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not reorder parent solutions");
  }
}

module.exports = { list, getOne, create, update, remove, reorder };
