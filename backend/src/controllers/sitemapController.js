const { query } = require("../config/db");

// Public site base URL (no trailing slash). Set PUBLIC_SITE_URL in the env.
const SITE_URL = (process.env.PUBLIC_SITE_URL || "https://globalatd.com").replace(/\/+$/, "");

// Static, always-public pages. Trailing slash matches the static export
// (next.config trailingSlash: true). /admin is intentionally excluded.
const STATIC_PATHS = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/about/", priority: "0.7", changefreq: "monthly" },
  { path: "/services/", priority: "0.7", changefreq: "monthly" },
  { path: "/solutions/", priority: "0.9", changefreq: "weekly" },
  { path: "/blog/", priority: "0.8", changefreq: "daily" },
  { path: "/contact/", priority: "0.6", changefreq: "monthly" },
];

function xmlEscape(s) {
  return String(s).replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c])
  );
}

// W3C date (YYYY-MM-DD) for <lastmod>; returns null for missing/invalid dates.
function fmtDate(d) {
  if (!d) return null;
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10);
}

function urlTag({ loc, lastmod, changefreq, priority }) {
  let s = "  <url>\n";
  s += `    <loc>${xmlEscape(loc)}</loc>\n`;
  if (lastmod) s += `    <lastmod>${lastmod}</lastmod>\n`;
  if (changefreq) s += `    <changefreq>${changefreq}</changefreq>\n`;
  if (priority) s += `    <priority>${priority}</priority>\n`;
  s += "  </url>\n";
  return s;
}

// Build the full list of public URLs from static pages + live CMS content.
// Each entry is tagged with a `type` so the admin summary can group counts.
async function collectUrls() {
  const urls = STATIC_PATHS.map((s) => ({
    type: "static",
    loc: `${SITE_URL}${s.path}`,
    changefreq: s.changefreq,
    priority: s.priority,
  }));

  // Solutions (parent_solutions) — only active + clickable have a public page.
  const parents = await query(
    `SELECT slug, updated_at FROM parent_solutions
      WHERE is_active = 1 AND delete_status = 0 AND is_clickable = 1
      ORDER BY sort_order ASC, title ASC`
  );
  for (const p of parents) {
    urls.push({
      type: "solution",
      loc: `${SITE_URL}/solutions/${p.slug}/`,
      lastmod: fmtDate(p.updated_at),
      changefreq: "weekly",
      priority: "0.8",
    });
  }

  // Programs (child_solutions).
  const children = await query(
    `SELECT slug, updated_at FROM child_solutions
      WHERE is_active = 1 AND delete_status = 0
      ORDER BY sort_order ASC, title ASC`
  );
  for (const c of children) {
    urls.push({
      type: "program",
      loc: `${SITE_URL}/solutions/${c.slug}/`,
      lastmod: fmtDate(c.updated_at),
      changefreq: "weekly",
      priority: "0.8",
    });
  }

  // Subprograms (solution_programs) — URL is /solutions/<child>/<subprogram>/.
  const subs = await query(
    `SELECT sp.slug, sp.updated_at, c.slug AS child_slug
       FROM solution_programs sp JOIN child_solutions c ON c.id = sp.child_solution_id
      WHERE sp.is_published = 1 AND sp.is_active = 1 AND sp.delete_status = 0
        AND c.is_active = 1 AND c.delete_status = 0
      ORDER BY sp.sort_order ASC, sp.title ASC`
  );
  for (const s of subs) {
    urls.push({
      type: "subprogram",
      loc: `${SITE_URL}/solutions/${s.child_slug}/${s.slug}/`,
      lastmod: fmtDate(s.updated_at),
      changefreq: "weekly",
      priority: "0.7",
    });
  }

  // Blog posts.
  const blogs = await query(
    `SELECT slug, updated_at, published_at FROM blogs
      WHERE is_published = 1 AND delete_status = 0
      ORDER BY published_at DESC`
  );
  for (const b of blogs) {
    urls.push({
      type: "blog",
      loc: `${SITE_URL}/blog/${b.slug}/`,
      lastmod: fmtDate(b.updated_at || b.published_at),
      changefreq: "monthly",
      priority: "0.6",
    });
  }

  return urls;
}

// GET /sitemap.xml — live XML sitemap (public). Regenerates from the DB on every
// request, so new Solutions/Programs/Subprograms/Blogs appear automatically.
async function sitemapXml(req, res) {
  try {
    const urls = await collectUrls();
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    for (const u of urls) xml += urlTag(u);
    xml += "</urlset>\n";
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.send(xml);
  } catch (err) {
    console.error("[sitemap] xml error:", err);
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    return res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>');
  }
}

// GET /apis/admin/sitemap — JSON summary for the dashboard (auth required).
async function sitemapSummary(req, res) {
  try {
    const urls = await collectUrls();
    const countBy = (t) => urls.filter((u) => u.type === t).length;
    return res.json({
      data: {
        url: `${SITE_URL}/sitemap.xml`,
        total: urls.length,
        counts: {
          static: countBy("static"),
          solutions: countBy("solution"),
          programs: countBy("program"),
          subprograms: countBy("subprogram"),
          blogs: countBy("blog"),
        },
        generatedAt: new Date().toISOString(),
        // A small sample so the admin can eyeball the output without opening XML.
        sample: urls.slice(0, 20).map((u) => u.loc),
      },
    });
  } catch (err) {
    console.error("[sitemap] summary error:", err);
    const { sendError } = require("../utils/http");
    return sendError(res, 500, "SERVER_ERROR", "Could not build sitemap summary");
  }
}

module.exports = { sitemapXml, sitemapSummary, collectUrls };
