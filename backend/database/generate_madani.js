/**
 * Generates madani_subprogram.sql — a Draft (is_published=0) solution_program row
 * for "MADANI Leadership for Public Sector Transformation". Content from the
 * client's spec PDF. Run:  node database/generate_madani.js
 *
 * The row is inserted under the parent Program (child_solution) identified by
 * @parent_slug — CHANGE that at the top of the generated SQL to the correct slug.
 */
const fs = require("fs");
const path = require("path");

// ── SQL literal helper ──────────────────────────────────────────────────────
function q(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  return "'" + String(v).replace(/\\/g, "\\\\").replace(/'/g, "''") + "'";
}
function json(v) {
  if (v === null || v === undefined) return "NULL";
  return "'" + JSON.stringify(v).replace(/\\/g, "\\\\").replace(/'/g, "''") + "'";
}

// ── Content ─────────────────────────────────────────────────────────────────
const slug = "madani-leadership-for-public-sector-transformation";

const description =
  "A 5-day executive development programme designed for Malaysian government officials to " +
  "strengthen leadership capability, human capital effectiveness, policy execution and future-ready " +
  "governance in line with the Malaysia MADANI vision.";

const overview = {
  title: "MADANI Leadership for Public Sector Transformation",
  description:
    "MADANI Leadership for Public Sector Transformation is a 5-day executive programme designed to " +
    "strengthen leadership, human capital, policy execution and future-ready governance in line with the " +
    "Malaysia MADANI vision. Grounded in integrity, trust, sustainability, innovation and compassion, the " +
    "programme develops ethical leadership, accountable governance and citizen-centric public service " +
    "delivery through interactive learning, case studies, peer learning and action planning.",
  image: "/images/solutions/strategic-hr/programme-suits.jpg",
};

const gains = [
  "Build the capability to lead self, teams and institutions through complexity.",
  "Manage talent, performance, workforce capability and succession more strategically.",
  "Translate policy priorities into executable strategies and measurable outcomes.",
  "Identify practical applications of digital technologies and AI for public-service improvement.",
  "Strengthen integrity, risk management, sustainability and institutional resilience.",
  "Develop practical action plans that connect leadership and institutional priorities with long-term national outcomes.",
].map((text, i) => ({ text, iconSrc: `/images/solutions/strategic-hr/${i + 1}.svg` }));

const focusAreas = [
  ["Senior-Level Positioning", "Designed for senior and high-potential public-sector leaders."],
  ["Transformational, Not Training", "Focused on translating leadership knowledge into practical institutional action."],
  ["Leadership & Human Capital", "Strengthening leadership capability and strategic management of public-sector talent."],
  ["Digital Strategies & Policy Execution", "Connecting digital transformation, AI and effective policy implementation."],
  ["Governance & National Impact", "Building integrity, resilience, sustainability and long-term public value."],
].map(([title, desc], i) => ({ title, description: desc, iconSrc: `/images/solutions/strategic-hr/${i + 1}.svg` }));

const faqs = [
  ["What is the duration of the programme?", "The programme is delivered over 5 days."],
  ["Who is the programme designed for?", "It is designed for Malaysian government officials, particularly senior and high-potential public servants."],
  ["What areas does the programme cover?", "The programme covers public-sector leadership, strategic human capital, policy execution, digital government and AI, citizen-centric services, governance, risk, sustainability and national impact."],
  ["What learning methods are used?", "The programme combines conceptual learning, action learning, experiential learning, executive coaching and case-based learning."],
].map(([question, answer]) => ({ question, answer }));

// Facilitator — reuses the Strategic HR "Dr. Joel" details (per the spec). Stored
// as an array so a 2nd facilitator can be appended → the page shows prev/next nav.
const facilitators = [
  {
    name: "Prof. Dr. Joel Farnworth",
    role: "Dean of Business and Management Studies, EIU-Paris",
    image: "/images/solutions/strategic-hr/Dr_Joel.png",
    bg: "/images/solutions/strategic-hr/program_facilitator_BG.png",
    expertise: [
      "Human Resource Management",
      "Leadership Development",
      "Managerial Skills Development",
      "Corporate Strategy Creation and Implementation",
      "Performance Management",
      "Strategic HRM",
    ],
    biography: [
      "Coach and Consultant",
      "Strategic HR Management",
      "Impactive Leadership",
      "Creating and Implementing Corporate Strategy",
      "Senior Management Advisor",
    ],
  },
];

const certification = {
  badge: "Recognition of Learning",
  heading: "Certification\non Successful\nCompletion",
  paragraphs: [
    "Participants who successfully complete the programme will receive certification recognising their " +
      "participation and completion of the MADANI Leadership for Public Sector Transformation executive " +
      "development programme.",
  ],
  image: "/images/solutions/strategic-hr/certificate_image.jpg",
};

const DAYS = [
  ["Public Sector Leadership Excellence", "Leading Self, Teams & Institutions in Government",
    ["Contemporary leadership challenges", "Adaptive and ethical leadership", "Leading through complexity and ambiguity", "Values-based leadership and public accountability", "Leadership self-assessment"]],
  ["Strategic Human Capital Management in Government", "Building Capable, Engaged & Future-Ready Public Servants",
    ["Strategic workforce planning", "Talent and succession management", "Performance and outcome-based appraisal", "Multi-generational and diverse workforces", "Culture and change transformation"]],
  ["Public Sector Strategy & Policy Execution", "Translating Policy into Measurable Impact",
    ["Strategy formulation and execution", "Policy implementation frameworks", "Whole-of-government collaboration", "KPIs and performance dashboards", "ASEAN public-sector reform case studies"]],
  ["Digital Government, AI & Citizen-Centric Services", "Leveraging Technology for Better Public Value",
    ["Digital transformation in government", "AI and data analytics applications", "Citizen-centric digital services", "Data governance, cybersecurity and ethics", "Digital change and capability building"]],
  ["Governance, Risk, Sustainability & National Impact", "Leading with Integrity, Resilience & Long-Term Vision",
    ["Good governance and integrity", "Risk management", "Sustainability, ESG and national value", "Crisis leadership and institutional resilience", "Personal leadership action plan"]],
];
const layoutData = {
  heading: "5 Days of Leadership & Transformation",
  badge: "5 Days",
  days: DAYS.map(([theme, subtitle, bullets], i) => ({
    label: `DAY ${i + 1}`,
    sessions: [{ color: i % 2 === 0 ? "red" : "dark", title: `${theme} — ${subtitle}`, bullets }],
  })),
};

// ── Columns (order matters, must match the VALUES below) ─────────────────────
const cols = {
  slug: q(slug),
  eyebrow: q("Certified Programs"),
  title: q("MADANI Leadership for Public Sector Transformation"),
  description: q(description),
  banner: q("/images/solutions/strategic-hr/banner.jpg"),
  card_image: q("/images/solutions/Certified-Programs/certified-1.jpg"),
  rating: "NULL",
  reviews: 0,
  rating_enabled: 1,
  price_cents: 450000,
  currency: q("USD"),
  pricing_period: q("Person"),
  pricing_heading: q("Why It's Worth"),
  pricing_description: q("A 5-day executive development programme, designed to strengthen leadership, human capital, policy execution, digital governance and national impact."),
  registration_heading: q("MADANI Leadership for Public Sector Transformation"),
  overview: json(overview),
  gains_heading: q("What You'll Gain From This Programme"),
  gains: json(gains),
  focus_heading: q("Focuses on Developing"),
  focus_areas: json(focusAreas),
  faqs: json(faqs),
  facilitator: json(facilitators), // array; add a 2nd facilitator to show prev/next nav
  certification: json(certification),
  layout_type: q("curriculum"),
  layout_data: json(layoutData),
  is_published: 0, // DRAFT — hidden from nav/catalog/listings; viewable only via ?preview=<token>
  is_active: 1,
  sort_order: 0,
};

const colNames = Object.keys(cols);
const sql = `-- MADANI Leadership for Public Sector Transformation — Draft subprogram (solution_programs).
-- Generated by generate_madani.js from the client's spec. Safe to import via phpMyAdmin.
-- It stays hidden from the navbar/catalog/listings (is_published = 0) and is viewable
-- only by direct link with the preview token:
--   /solutions/<parent-slug>/${slug}/?preview=<PREVIEW_TOKEN>
-- When the client approves, set Published = ON in Admin -> Subprograms (or is_published=1).

SET NAMES utf8mb4;

-- ⚠️ CHANGE this to the parent Program (child_solution) slug MADANI sits under
-- (as shown in Admin -> Subprograms -> "Program (parent)"):
SET @parent_slug = 'strategic-hr';

INSERT INTO solution_programs
  (child_solution_id, ${colNames.join(", ")})
VALUES
  ((SELECT id FROM child_solutions WHERE slug = @parent_slug AND delete_status = 0 LIMIT 1),
   ${colNames.map((k) => cols[k]).join(",\n   ")});
`;

const outPath = path.join(__dirname, "madani_subprogram.sql");
fs.writeFileSync(outPath, sql, "utf8");
console.log("Wrote", outPath, `(${sql.length} bytes)`);
