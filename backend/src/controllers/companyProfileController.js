const { query } = require("../config/db");
const { sendError } = require("../utils/http");

// pdf_url must be a same-site path (/…) or an http(s) URL — never javascript: etc.
const SAFE_LINK_RE = /^(https?:\/\/|\/(?!\/))/i;

const DEFAULTS = {
  is_enabled: 1,
  eyebrow: "Company Profile",
  heading: "Download Our Company Profile",
  description: "Enter your details and we will share the GATD company profile with you.",
  button_label: "Company Profile",
  pdf_url: "/brochures/GATD-Company-Profile.pdf",
};

function mapRow(r) {
  return {
    isEnabled: !!r.is_enabled,
    eyebrow: r.eyebrow,
    heading: r.heading,
    description: r.description,
    buttonLabel: r.button_label,
    pdfUrl: r.pdf_url,
    updatedAt: r.updated_at,
  };
}

/** Return the singleton settings row, creating it with defaults if missing. */
async function ensureRow() {
  const rows = await query(`SELECT * FROM company_profile WHERE id = 1 LIMIT 1`);
  if (rows[0]) return rows[0];
  await query(
    `INSERT INTO company_profile (id, is_enabled, eyebrow, heading, description, button_label, pdf_url)
     VALUES (1, ?, ?, ?, ?, ?, ?)`,
    [DEFAULTS.is_enabled, DEFAULTS.eyebrow, DEFAULTS.heading, DEFAULTS.description, DEFAULTS.button_label, DEFAULTS.pdf_url]
  );
  const created = await query(`SELECT * FROM company_profile WHERE id = 1 LIMIT 1`);
  return created[0];
}

// GET /apis/public/company-profile  — settings the popup needs (public)
async function getPublic(req, res) {
  try {
    return res.json({ data: mapRow(await ensureRow()) });
  } catch (err) {
    console.error("[company-profile] public get error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load company profile");
  }
}

// GET /apis/admin/company-profile  (admin)
async function getAdmin(req, res) {
  try {
    return res.json({ data: mapRow(await ensureRow()) });
  } catch (err) {
    console.error("[company-profile] admin get error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load company profile");
  }
}

// PATCH /apis/admin/company-profile  (admin) — update settings
async function update(req, res) {
  try {
    await ensureRow();
    const b = req.body || {};
    const cols = {};
    const fields = {};

    if (b.isEnabled !== undefined) cols.is_enabled = b.isEnabled ? 1 : 0;

    for (const [col, key, max] of [
      ["eyebrow", "eyebrow", 120],
      ["heading", "heading", 255],
      ["button_label", "buttonLabel", 80],
    ]) {
      if (b[key] === undefined) continue;
      const v = b[key] == null ? "" : String(b[key]).trim();
      if (v.length > max) fields[key] = `Must be ≤ ${max} characters`;
      else cols[col] = v || null;
    }

    if (b.description !== undefined) cols.description = b.description == null ? null : String(b.description);

    if (b.pdfUrl !== undefined) {
      const v = b.pdfUrl == null ? "" : String(b.pdfUrl).trim();
      if (!v) cols.pdf_url = null;
      else if (!SAFE_LINK_RE.test(v)) fields.pdfUrl = "PDF URL must be a relative path (/…) or an http(s):// URL";
      else cols.pdf_url = v;
    }

    if (Object.keys(fields).length) return sendError(res, 422, "VALIDATION_ERROR", "One or more fields are invalid", fields);
    if (!Object.keys(cols).length) return sendError(res, 422, "VALIDATION_ERROR", "No updatable fields provided");

    const setClause = Object.keys(cols).map((c) => `${c} = ?`).join(", ");
    await query(`UPDATE company_profile SET ${setClause} WHERE id = 1`, Object.values(cols));

    const rows = await query(`SELECT * FROM company_profile WHERE id = 1 LIMIT 1`);
    return res.json({ data: mapRow(rows[0]) });
  } catch (err) {
    console.error("[company-profile] update error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not update company profile");
  }
}

module.exports = { getPublic, getAdmin, update };
