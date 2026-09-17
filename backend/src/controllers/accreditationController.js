const { query } = require("../config/db");
const { sendError } = require("../utils/http");

// Global "Accredited By" settings (single row id=1): a heading + a list of logos,
// shown on every public Program page (each program can still hide the section via
// its own show_accredited_by toggle).

const DEFAULT_HEADING = "Accredited By";
const DEFAULT_LOGOS = [
  { name: "European Council for Business Education", logo: "/images/solutions/strategic-hr/1.png" },
  { name: "QS Stars Rating System - Online Learning", logo: "/images/solutions/strategic-hr/2.png" },
  { name: "ACBSP Global Business Accreditation", logo: "/images/solutions/strategic-hr/3.png" },
  { name: "ASIC Accreditation Service for International Colleges", logo: "/images/solutions/strategic-hr/4.png" },
  { name: "Business Graduates Association Member", logo: "/images/solutions/strategic-hr/5.png" },
  { name: "ATHEA", logo: "/images/solutions/strategic-hr/6.jpg" },
  { name: "Cambridge International Academics", logo: "/images/solutions/strategic-hr/7.jpg" },
];

function parseLogos(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === "string" && v.trim()) {
    try {
      const p = JSON.parse(v);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapRow(r) {
  return {
    heading: r.heading || DEFAULT_HEADING,
    logos: parseLogos(r.logos),
    updatedAt: r.updated_at,
  };
}

/** Return the singleton row, creating it with the current defaults if missing. */
async function ensureRow() {
  const rows = await query(`SELECT * FROM accreditation_settings WHERE id = 1 LIMIT 1`);
  if (rows[0]) return rows[0];
  await query(
    `INSERT INTO accreditation_settings (id, heading, logos) VALUES (1, ?, ?)`,
    [DEFAULT_HEADING, JSON.stringify(DEFAULT_LOGOS)]
  );
  const created = await query(`SELECT * FROM accreditation_settings WHERE id = 1 LIMIT 1`);
  return created[0];
}

// GET /apis/public/accreditation  (public)
async function getPublic(req, res) {
  try {
    return res.json({ data: mapRow(await ensureRow()) });
  } catch (err) {
    console.error("[accreditation] public get error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load accreditation");
  }
}

// GET /apis/admin/accreditation  (admin)
async function getAdmin(req, res) {
  try {
    return res.json({ data: mapRow(await ensureRow()) });
  } catch (err) {
    console.error("[accreditation] admin get error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load accreditation");
  }
}

// PATCH /apis/admin/accreditation  (admin) — update heading + logos
async function update(req, res) {
  try {
    await ensureRow();
    const b = req.body || {};
    const cols = {};
    const fields = {};

    if (b.heading !== undefined) {
      const v = b.heading == null ? "" : String(b.heading).trim();
      if (v.length > 255) fields.heading = "Heading must be ≤ 255 characters";
      else cols.heading = v || null;
    }

    if (b.logos !== undefined) {
      if (!Array.isArray(b.logos)) {
        fields.logos = "logos must be an array";
      } else {
        const cleaned = b.logos
          .filter((l) => l && (l.logo || l.name))
          .map((l) => ({
            name: String(l.name || "").trim().slice(0, 200),
            logo: String(l.logo || "").trim().slice(0, 500),
          }))
          .filter((l) => l.logo); // a logo entry needs an image
        cols.logos = JSON.stringify(cleaned);
      }
    }

    if (Object.keys(fields).length) return sendError(res, 422, "VALIDATION_ERROR", "One or more fields are invalid", fields);
    if (!Object.keys(cols).length) return sendError(res, 422, "VALIDATION_ERROR", "No updatable fields provided");

    const setClause = Object.keys(cols).map((c) => `${c} = ?`).join(", ");
    await query(`UPDATE accreditation_settings SET ${setClause} WHERE id = 1`, Object.values(cols));

    const rows = await query(`SELECT * FROM accreditation_settings WHERE id = 1 LIMIT 1`);
    return res.json({ data: mapRow(rows[0]) });
  } catch (err) {
    console.error("[accreditation] update error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not update accreditation");
  }
}

module.exports = { getPublic, getAdmin, update };
