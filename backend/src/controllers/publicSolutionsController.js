const { query } = require("../config/db");
const { sendError } = require("../utils/http");
const { mapChild, programmesProjection } = require("./childSolutionsController");
const { mapProgram } = require("./solutionProgramsController");

// Drop internal/housekeeping fields from public payloads.
function stripInternal(obj) {
  const { id, isActive, isPublished, sortOrder, childSolutionId, parentSolutionId, programCount, ...rest } = obj;
  return rest;
}

// Secret preview: a valid ?preview= / ?key= token lets a Draft/Hidden Program or
// Subprogram be viewed by direct link only (still absent from nav/catalog/listings),
// so it can be shared for approval before going live. Configure PREVIEW_TOKEN in env.
const PREVIEW_TOKEN = process.env.PREVIEW_TOKEN || "";
function isPreview(req) {
  const key = String(req.query.preview || req.query.key || "");
  return PREVIEW_TOKEN.length > 0 && key === PREVIEW_TOKEN;
}

// GET /apis/public/solutions  — all active parents, each with active children
async function catalog(req, res) {
  try {
    const parents = await query(
      `SELECT id, slug, title, description, is_clickable FROM parent_solutions
        WHERE is_active = 1 AND delete_status = 0 ORDER BY sort_order ASC, title ASC`
    );
    const children = await query(
      `SELECT c.parent_solution_id, c.slug, c.title, c.description, c.eyebrow, c.card_image,
              c.rating, c.reviews, c.rating_enabled, c.is_clickable, c.link_url
         FROM child_solutions c JOIN parent_solutions p ON p.id = c.parent_solution_id
        WHERE c.is_active = 1 AND c.delete_status = 0 AND p.is_active = 1 AND p.delete_status = 0
        ORDER BY c.sort_order ASC, c.title ASC`
    );

    const byParent = new Map();
    for (const c of children) {
      const clickable = !!c.is_clickable;
      const item = {
        slug: c.slug, title: c.title, description: c.description, eyebrow: c.eyebrow,
        cardImage: c.card_image, rating: c.rating != null ? Number(c.rating) : null, reviews: c.reviews,
        ratingEnabled: c.rating_enabled == null ? true : !!c.rating_enabled,
        // Admin-controlled: whether the card links out, and to where.
        clickable,
        href: clickable ? (c.link_url || `/solutions/${c.slug}`) : null,
      };
      if (!byParent.has(c.parent_solution_id)) byParent.set(c.parent_solution_id, []);
      byParent.get(c.parent_solution_id).push(item);
    }

    const data = parents.map((p) => ({
      slug: p.slug, title: p.title, description: p.description,
      isClickable: p.is_clickable == null ? true : !!p.is_clickable,
      children: byParent.get(p.id) || [],
    }));
    return res.json({ data });
  } catch (err) {
    console.error("[public] catalog error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load solutions");
  }
}

// GET /apis/public/solutions/menu — full 3-level tree for the header dropdown:
// parent_solutions → child_solutions (Programs) → solution_programs (Subprograms).
// Minimal fields (slug/title/href) so the nav stays light.
async function menu(req, res) {
  try {
    const parents = await query(
      `SELECT id, slug, title, is_clickable FROM parent_solutions
        WHERE is_active = 1 AND delete_status = 0 ORDER BY sort_order ASC, title ASC`
    );
    const children = await query(
      `SELECT c.id, c.parent_solution_id, c.slug, c.title, c.is_clickable, c.link_url
         FROM child_solutions c JOIN parent_solutions p ON p.id = c.parent_solution_id
        WHERE c.is_active = 1 AND c.delete_status = 0 AND p.is_active = 1 AND p.delete_status = 0
        ORDER BY c.sort_order ASC, c.title ASC`
    );
    const programs = await query(
      `SELECT sp.child_solution_id, sp.slug, sp.title, sp.is_clickable, sp.link_url, c.slug AS child_slug
         FROM solution_programs sp
         JOIN child_solutions c ON c.id = sp.child_solution_id
         JOIN parent_solutions p ON p.id = c.parent_solution_id
        WHERE sp.is_published = 1 AND sp.is_active = 1 AND sp.delete_status = 0
          AND c.is_active = 1 AND c.delete_status = 0
          AND p.is_active = 1 AND p.delete_status = 0
        ORDER BY sp.sort_order ASC, sp.title ASC`
    );

    // Respect the admin "clickable" setting: a non-clickable Program/Subprogram
    // gets href = null so the header renders it as plain text (not a link).
    const progsByChild = new Map();
    for (const sp of programs) {
      if (!progsByChild.has(sp.child_solution_id)) progsByChild.set(sp.child_solution_id, []);
      progsByChild.get(sp.child_solution_id).push({
        slug: sp.slug,
        title: sp.title,
        // menu query already filters to published+active, so its own page exists.
        href: sp.is_clickable ? (sp.link_url || `/solutions/${sp.child_slug}/${sp.slug}`) : null,
      });
    }
    const childrenByParent = new Map();
    for (const c of children) {
      if (!childrenByParent.has(c.parent_solution_id)) childrenByParent.set(c.parent_solution_id, []);
      childrenByParent.get(c.parent_solution_id).push({
        slug: c.slug,
        title: c.title,
        href: c.is_clickable ? (c.link_url || `/solutions/${c.slug}`) : null,
        children: progsByChild.get(c.id) || [],
      });
    }
    const data = parents.map((p) => ({
      slug: p.slug,
      title: p.title,
      // Admin "clickable" toggle: null href → header renders the category as plain
      // text (hover still reveals its Programs).
      href: p.is_clickable ? `/solutions/${p.slug}` : null,
      items: childrenByParent.get(p.id) || [],
    }));
    return res.json({ data });
  } catch (err) {
    console.error("[public] menu error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load menu");
  }
}

// GET /apis/public/solutions/:parentSlug — one parent + its active children
async function parent(req, res) {
  try {
    const parents = await query(
            `SELECT id, slug, title, description, eyebrow, banner, middle_image, middle_badge, middle_heading, middle_body,
              commitment_banner_eyebrow, commitment_banner_heading, commitment_cta_text, commitment_cta_url,
              show_commitment_banner, show_commitment_cta
         FROM parent_solutions
        WHERE slug = ? AND is_active = 1 AND delete_status = 0 LIMIT 1`,
      [req.params.parentSlug]
    );
    if (!parents[0]) return sendError(res, 404, "NOT_FOUND", "Solution not found");

    const children = await query(
      `SELECT slug, title, description, eyebrow, card_image, rating, reviews, rating_enabled, is_clickable, link_url
         FROM child_solutions
        WHERE parent_solution_id = ? AND is_active = 1 AND delete_status = 0 ORDER BY sort_order ASC, title ASC`,
      [parents[0].id]
    );
    const p = parents[0];
    return res.json({
      data: {
        slug: p.slug, title: p.title, description: p.description,
        eyebrow: p.eyebrow, banner: p.banner,
        middleImage: p.middle_image, middleBadge: p.middle_badge,
        middleHeading: p.middle_heading, middleBody: p.middle_body,
        commitmentBannerEyebrow: p.commitment_banner_eyebrow,
        commitmentBannerHeading: p.commitment_banner_heading,
        commitmentCtaText: p.commitment_cta_text,
        commitmentCtaUrl: p.commitment_cta_url,
        showCommitmentBanner: p.show_commitment_banner == null ? true : !!p.show_commitment_banner,
        showCommitmentCta: p.show_commitment_cta == null ? true : !!p.show_commitment_cta,
        children: children.map((c) => ({
          slug: c.slug, title: c.title, description: c.description, eyebrow: c.eyebrow,
          cardImage: c.card_image, rating: c.rating != null ? Number(c.rating) : null, reviews: c.reviews,
          ratingEnabled: c.rating_enabled == null ? true : !!c.rating_enabled,
          // Respect the admin "clickable" toggle — null href renders as a non-link card.
          href: c.is_clickable ? (c.link_url || `/solutions/${c.slug}`) : null,
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
    const preview = isPreview(req);
    const gate = preview
      ? "c.delete_status = 0 AND p.delete_status = 0"
      : "c.is_active = 1 AND c.delete_status = 0 AND p.is_active = 1 AND p.delete_status = 0";
    const rows = await query(
      `SELECT c.*, p.slug AS parent_slug FROM child_solutions c JOIN parent_solutions p ON p.id = c.parent_solution_id
        WHERE c.slug = ? AND ${gate} LIMIT 1`,
      [req.params.slug]
    );
    if (!rows[0]) return sendError(res, 404, "NOT_FOUND", "Solution not found");

    const data = stripInternal(mapChild(rows[0]));
    // In preview, include Draft subprogrammes too so the page renders complete.
    data.programmes = await programmesProjection(rows[0].id, rows[0].slug, {
      publishedOnly: !preview,
      activeOnly: !preview,
    });
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
    const preview = isPreview(req);
    const gate = preview
      ? "sp.delete_status = 0 AND c.delete_status = 0"
      : "sp.is_published = 1 AND sp.is_active = 1 AND sp.delete_status = 0 AND c.is_active = 1 AND c.delete_status = 0";
    const rows = await query(
      `SELECT sp.*, c.slug AS child_slug, c.title AS child_title,
              p.slug AS parent_slug, p.title AS parent_title
         FROM solution_programs sp
         JOIN child_solutions c ON c.id = sp.child_solution_id
         JOIN parent_solutions p ON p.id = c.parent_solution_id
        WHERE sp.slug = ? AND ${gate} LIMIT 1`,
      [req.params.slug]
    );
    if (!rows[0]) return sendError(res, 404, "NOT_FOUND", "Program not found");
    const data = stripInternal(mapProgram(rows[0]));
    // Hierarchy for the breadcrumb + registration form context.
    data.childSolutionTitle = rows[0].child_title; // Program (child_solution)
    data.parentSolutionSlug = rows[0].parent_slug; // Solution (parent_solution)
    data.parentSolutionTitle = rows[0].parent_title;

    // Registration options: the priced, published+active Subprograms that belong
    // to THIS Program only (so a program page never offers unrelated programmes).
    const opts = await query(
      `SELECT slug, title, price_cents, currency FROM solution_programs
        WHERE child_solution_id = ? AND is_published = 1 AND is_active = 1 AND delete_status = 0
          AND price_cents IS NOT NULL
        ORDER BY sort_order ASC, title ASC`,
      [rows[0].child_solution_id]
    );
    data.registrationOptions = opts.map((o) => ({
      slug: o.slug, title: o.title, priceCents: o.price_cents, currency: o.currency,
    }));
    // In preview, the current (Draft) program isn't in the published list above —
    // include it so its registration form still shows it.
    if (preview && rows[0].price_cents != null && !opts.find((o) => o.slug === rows[0].slug)) {
      data.registrationOptions.unshift({
        slug: rows[0].slug, title: rows[0].title, priceCents: rows[0].price_cents, currency: rows[0].currency,
      });
    }
    return res.json({ data });
  } catch (err) {
    console.error("[public] program error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load program");
  }
}

module.exports = { catalog, menu, parent, child, programsList, program };
