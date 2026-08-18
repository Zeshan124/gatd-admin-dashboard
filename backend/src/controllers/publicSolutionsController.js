const { query } = require("../config/db");
const { sendError } = require("../utils/http");
const { mapChild, programmesProjection } = require("./childSolutionsController");
const { mapProgram } = require("./solutionProgramsController");

// Drop internal/housekeeping fields from public payloads.
function stripInternal(obj) {
  const { id, isActive, isPublished, sortOrder, childSolutionId, parentSolutionId, programCount, ...rest } = obj;
  return rest;
}

// GET /apis/public/solutions  — all active parents, each with active children
async function catalog(req, res) {
  try {
    const parents = await query(
      `SELECT id, slug, title, description FROM parent_solutions
        WHERE is_active = 1 AND delete_status = 0 ORDER BY sort_order ASC, title ASC`
    );
    const children = await query(
      `SELECT c.parent_solution_id, c.slug, c.title, c.description, c.eyebrow, c.card_image, c.rating, c.reviews
         FROM child_solutions c JOIN parent_solutions p ON p.id = c.parent_solution_id
        WHERE c.is_active = 1 AND c.delete_status = 0 AND p.is_active = 1 AND p.delete_status = 0
        ORDER BY c.sort_order ASC, c.title ASC`
    );

    const byParent = new Map();
    for (const c of children) {
      const item = {
        slug: c.slug, title: c.title, description: c.description, eyebrow: c.eyebrow,
        cardImage: c.card_image, rating: c.rating != null ? Number(c.rating) : null, reviews: c.reviews,
      };
      if (!byParent.has(c.parent_solution_id)) byParent.set(c.parent_solution_id, []);
      byParent.get(c.parent_solution_id).push(item);
    }

    const data = parents.map((p) => ({
      slug: p.slug, title: p.title, description: p.description, children: byParent.get(p.id) || [],
    }));
    return res.json({ data });
  } catch (err) {
    console.error("[public] catalog error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load solutions");
  }
}

// GET /apis/public/solutions/:parentSlug — one parent + its active children
async function parent(req, res) {
  try {
    const parents = await query(
      `SELECT id, slug, title, description FROM parent_solutions
        WHERE slug = ? AND is_active = 1 AND delete_status = 0 LIMIT 1`,
      [req.params.parentSlug]
    );
    if (!parents[0]) return sendError(res, 404, "NOT_FOUND", "Solution not found");

    const children = await query(
      `SELECT slug, title, description, eyebrow, card_image, rating, reviews FROM child_solutions
        WHERE parent_solution_id = ? AND is_active = 1 AND delete_status = 0 ORDER BY sort_order ASC, title ASC`,
      [parents[0].id]
    );
    return res.json({
      data: {
        slug: parents[0].slug, title: parents[0].title, description: parents[0].description,
        children: children.map((c) => ({
          slug: c.slug, title: c.title, description: c.description, eyebrow: c.eyebrow,
          cardImage: c.card_image, rating: c.rating != null ? Number(c.rating) : null, reviews: c.reviews,
        })),
      },
    });
  } catch (err) {
    console.error("[public] parent error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load solution");
  }
}

// GET /apis/public/child-solutions/:slug — one child + its published programmes
async function child(req, res) {
  try {
    const rows = await query(
      `SELECT c.*, p.slug AS parent_slug FROM child_solutions c JOIN parent_solutions p ON p.id = c.parent_solution_id
        WHERE c.slug = ? AND c.is_active = 1 AND c.delete_status = 0 AND p.is_active = 1 AND p.delete_status = 0 LIMIT 1`,
      [req.params.slug]
    );
    if (!rows[0]) return sendError(res, 404, "NOT_FOUND", "Solution not found");

    const data = stripInternal(mapChild(rows[0]));
    data.programmes = await programmesProjection(rows[0].id, rows[0].slug, { publishedOnly: true, activeOnly: true });
    return res.json({ data });
  } catch (err) {
    console.error("[public] child error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load solution");
  }
}

// GET /apis/public/programs — all published+active programs (for generateStaticParams)
async function programsList(req, res) {
  try {
    const rows = await query(
      `SELECT sp.slug, sp.title, c.slug AS child_slug FROM solution_programs sp
         JOIN child_solutions c ON c.id = sp.child_solution_id
        WHERE sp.is_published = 1 AND sp.is_active = 1 AND sp.delete_status = 0
          AND c.is_active = 1 AND c.delete_status = 0
        ORDER BY sp.sort_order ASC, sp.title ASC`
    );
    return res.json({
      data: rows.map((r) => ({ slug: r.slug, title: r.title, childSolutionSlug: r.child_slug })),
    });
  } catch (err) {
    console.error("[public] programsList error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load programs");
  }
}

// GET /apis/public/programs/:slug — one full published program
async function program(req, res) {
  try {
    const rows = await query(
      `SELECT sp.*, c.slug AS child_slug FROM solution_programs sp
         JOIN child_solutions c ON c.id = sp.child_solution_id
        WHERE sp.slug = ? AND sp.is_published = 1 AND sp.is_active = 1 AND sp.delete_status = 0
          AND c.is_active = 1 AND c.delete_status = 0 LIMIT 1`,
      [req.params.slug]
    );
    if (!rows[0]) return sendError(res, 404, "NOT_FOUND", "Program not found");
    return res.json({ data: stripInternal(mapProgram(rows[0])) });
  } catch (err) {
    console.error("[public] program error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load program");
  }
}

module.exports = { catalog, parent, child, programsList, program };
