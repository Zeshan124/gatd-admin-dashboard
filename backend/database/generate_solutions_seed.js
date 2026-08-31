// One-time generator: reads the former hardcoded frontend data
// (frontend/lib/solutionsData.js + programsData.js) and emits solutions_seed.sql,
// which imports that content into the CMS tables (parent/child/solution_programs).
//
// Run:  node database/generate_solutions_seed.js   (from the backend/ folder)
// Then import the produced database/solutions_seed.sql via phpMyAdmin.

const fs = require("fs");
const path = require("path");

const FRONT_LIB = path.join(__dirname, "..", "..", "frontend", "lib");

// The frontend files use ESM `export const` but aren't Node-ESM configured, so we
// read them as text, drop the `export` keyword, and evaluate to get the objects.
function loadExport(file, varName) {
  const src = fs.readFileSync(path.join(FRONT_LIB, file), "utf8").replace(/export\s+const\s+/g, "const ");
  // eslint-disable-next-line no-new-func
  return new Function(`${src}\nreturn ${varName};`)();
}

const solutionsData = loadExport("solutionsData.js", "solutionsData");
const programsData = loadExport("programsData.js", "programsData");

// ---- SQL value helpers ----
function q(v) {
  if (v === null || v === undefined || v === "") return "NULL";
  if (typeof v === "number") return String(v);
  const s = String(v)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
  return `'${s}'`;
}
function j(v) {
  if (v === null || v === undefined) return "NULL";
  return q(JSON.stringify(v));
}
function num(v) {
  return v === null || v === undefined || v === "" ? "NULL" : String(v);
}
function reviews(v) {
  const n = num(v);
  return n === "NULL" ? "0" : n;
}
function priceCents(p) {
  if (p == null || p === "") return "NULL";
  const n = parseInt(String(p).replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? String(n * 100) : "NULL";
}
function currency(c) {
  const m = String(c || "").toUpperCase().replace(/[^A-Z]/g, "");
  return `'${(m || "SGD").slice(0, 3)}'`;
}

// programsData layout key → admin layout_type
const LAYOUT_KEYS = [
  ["precisionPillars", "precision_pillars"],
  ["strategyPanels", "people_strategy_panels"],
  ["learningJourney", "learning_journey"],
  ["orgFramework", "org_framework"],
  ["sessionPlan", "session_plan"],
  ["curriculum", "curriculum"],
  ["hexagons", "hexagons"],
];
function layoutOf(p) {
  for (const [key, type] of LAYOUT_KEYS) {
    if (p[key]) return { type, data: p[key] };
  }
  if (p.pillarHeading || p.pillarDays) {
    return {
      type: "strategic_pillars",
      data: { heading: p.pillarHeading, badge: p.pillarBadge, days: p.pillarDays, modulesByDay: p.pillarModules },
    };
  }
  return { type: null, data: null };
}

// Card image for each subprogram, taken from the child's programme card list.
const imgBySlug = {};
for (const child of Object.values(solutionsData)) {
  for (const pr of child.programmes || []) {
    const seg = String(pr.href || "").split("/").filter(Boolean).pop();
    if (seg && seg !== "#" && pr.image) imgBySlug[seg] = pr.image;
  }
}

// Distinct catalog thumbnails per child (the old SolutionsCatalog used these;
// solutionsData itself has no per-child card image, so map them here — otherwise
// every card falls back to the same shared banner).
const CARD_IMAGE_BY_SLUG = {
  "strategic-hr": "/images/solutions/Certified-Programs/certified-1.jpg",
  "change-management": "/images/solutions/Certified-Programs/certified-2.jpg",
  "ppp": "/images/solutions/Certified-Programs/certified-3.jpg",
  "kpis": "/images/solutions/Certified-Programs/certified-4.jpg",
};

// Parents (deduped from each child's parentSlug/parentTitle).
const parents = new Map();
for (const c of Object.values(solutionsData)) {
  if (c.parentSlug && !parents.has(c.parentSlug)) parents.set(c.parentSlug, c.parentTitle || c.parentSlug);
}

const childSlugs = Object.keys(solutionsData);
const programSlugs = Object.keys(programsData);

const out = [];
out.push("-- GATD Solutions seed — imports the former hardcoded lib/solutionsData.js + lib/programsData.js");
out.push("-- into parent_solutions / child_solutions / solution_programs.");
out.push("-- Re-runnable: upserts each parent, replaces the listed children (cascades their programs).");
out.push("-- Run AFTER solutions_schema.sql, against the CMS database (phpMyAdmin → Import).");
out.push("SET NAMES utf8mb4;");
out.push("START TRANSACTION;");
out.push("");

let psOrder = 0;
for (const [slug, title] of parents) {
  out.push(
    `INSERT INTO parent_solutions (slug, title, is_active, sort_order) VALUES (${q(slug)}, ${q(title)}, 1, ${psOrder})`
  );
  out.push(`  ON DUPLICATE KEY UPDATE title=VALUES(title), is_active=1, delete_status=0;`);
  psOrder++;
}
out.push("");

out.push(`DELETE FROM child_solutions WHERE slug IN (${childSlugs.map(q).join(", ")});`);
out.push("");

let csOrder = 0;
for (const slug of childSlugs) {
  const c = solutionsData[slug];
  const cols = [
    ["parent_solution_id", `(SELECT id FROM parent_solutions WHERE slug=${q(c.parentSlug)} LIMIT 1)`],
    ["slug", q(slug)],
    ["eyebrow", q(c.eyebrow)],
    ["title", q(c.title)],
    ["description", q(c.description || c.title)],
    ["subheading", q(c.subheading)],
    ["subtext", q(c.subtext)],
    ["banner", q(c.banner)],
    ["card_image", q(CARD_IMAGE_BY_SLUG[slug] || c.cardImage || c.banner)],
    ["programmes_heading", q(c.programmesHeading)],
    ["map_image", q(c.mapImage)],
    ["gains_heading", q(c.gainsHeading)],
    ["gains", j(c.gains)],
    ["why_heading", q(c.whyHeading)],
    ["why_badge", q(c.whyBadge)],
    ["why_image", q(c.whyImage)],
    ["audience_badge", q(c.audienceBadge)],
    ["audience_heading", q(c.audienceHeading)],
    ["audience_image", q(c.audienceImage)],
    ["audience", j(c.audience)],
    ["brochure", q(c.brochure)],
    ["rating", num(c.rating)],
    ["reviews", reviews(c.reviews)],
    ["is_active", "1"],
    ["sort_order", String(csOrder)],
  ];
  out.push(`INSERT INTO child_solutions (${cols.map((x) => x[0]).join(", ")})`);
  out.push(`VALUES (${cols.map((x) => x[1]).join(", ")});`);
  out.push("");
  csOrder++;
}

let spOrder = 0;
for (const slug of programSlugs) {
  const p = programsData[slug];
  const L = layoutOf(p);
  const cols = [
    ["child_solution_id", `(SELECT id FROM child_solutions WHERE slug=${q(p.parentSlug)} LIMIT 1)`],
    ["slug", q(slug)],
    ["eyebrow", q(p.eyebrow)],
    ["title", q(p.title)],
    ["description", q(p.description || p.title)],
    ["banner", q(p.banner)],
    ["card_image", q(imgBySlug[slug] || p.banner)],
    ["subheading", q(p.subheading)],
    ["subtext", q(p.subtext)],
    ["rating", num(p.rating)],
    ["reviews", reviews(p.reviews)],
    ["price_cents", priceCents(p.price)],
    ["currency", currency(p.pricingCurrency)],
    ["pricing_period", q(p.pricingPeriod)],
    ["pricing_heading", q(p.pricingHeading)],
    ["pricing_description", q(p.pricingDescription)],
    ["brochure", q(p.brochure)],
    ["registration_heading", q(p.registrationHeading)],
    ["overview", j(p.overview)],
    ["gains_heading", q(p.gainsHeading)],
    ["gains", j(p.gains)],
    ["focus_heading", q(p.focusHeading)],
    ["focus_areas", j(p.focusAreas)],
    ["faqs", j(p.faqs)],
    ["facilitator", j(p.facilitator)],
    ["certification", j(p.certification)],
    ["layout_type", q(L.type)],
    ["layout_data", j(L.data)],
    ["is_published", "1"],
    ["is_active", "1"],
    ["sort_order", String(spOrder)],
  ];
  out.push(`INSERT INTO solution_programs (${cols.map((x) => x[0]).join(", ")})`);
  out.push(`VALUES (${cols.map((x) => x[1]).join(", ")});`);
  out.push("");
  spOrder++;
}

out.push("COMMIT;");
out.push(`-- Seeded: ${parents.size} parent(s), ${childSlugs.length} child(ren), ${programSlugs.length} program(s).`);

fs.writeFileSync(path.join(__dirname, "solutions_seed.sql"), out.join("\n"), "utf8");
console.log(
  `Wrote solutions_seed.sql — ${parents.size} parent(s), ${childSlugs.length} child(ren), ${programSlugs.length} program(s).`
);
