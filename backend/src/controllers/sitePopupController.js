const { query } = require("../config/db");
const { sendError } = require("../utils/http");

// button_url / image must be a same-site path (/…) or an http(s) URL — never javascript: etc.
const SAFE_LINK_RE = /^(https?:\/\/|\/(?!\/))/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const FREQUENCIES = ["session", "daily", "always"];

// DATE columns are read as plain YYYY-MM-DD strings so no timezone shifting happens.
const SELECT_ROW = `SELECT *,
  DATE_FORMAT(show_from, '%Y-%m-%d')  AS show_from_s,
  DATE_FORMAT(show_until, '%Y-%m-%d') AS show_until_s,
  DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date_s,
  DATE_FORMAT(end_date, '%Y-%m-%d')   AS end_date_s
  FROM site_popup WHERE id = 1 LIMIT 1`;

function mapRow(r) {
  return {
    isEnabled: !!r.is_enabled,
    showFrom: r.show_from_s || null,
    showUntil: r.show_until_s || null,
    frequency: FREQUENCIES.includes(r.frequency) ? r.frequency : "session",
    delaySeconds: r.delay_seconds == null ? 1 : Number(r.delay_seconds),
    eyebrow: r.eyebrow,
    titleHighlight: r.title_highlight,
    title: r.title,
    description: r.description,
    startDate: r.start_date_s || null,
    endDate: r.end_date_s || null,
    locationCity: r.location_city,
    locationCountry: r.location_country,
    priceLabel: r.price_label,
    price: r.price,
    priceUnit: r.price_unit,
    badgeText: r.badge_text,
    buttonText: r.button_text,
    buttonUrl: r.button_url,
    image: r.image,
    updatedAt: r.updated_at,
  };
}

/** Return the singleton row, creating it (disabled) if missing. */
async function ensureRow() {
  const rows = await query(SELECT_ROW);
  if (rows[0]) return rows[0];
  await query(`INSERT INTO site_popup (id, is_enabled) VALUES (1, 0)`);
  const created = await query(SELECT_ROW);
  return created[0];
}

// GET /apis/public/site-popup — { data: null } when switched off.
async function getPublic(req, res) {
  try {
    const row = await ensureRow();
    return res.json({ data: row.is_enabled ? mapRow(row) : null });
  } catch (err) {
    console.error("[site-popup] public get error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load popup");
  }
}

// GET /apis/admin/site-popup  (admin)
async function getAdmin(req, res) {
  try {
    return res.json({ data: mapRow(await ensureRow()) });
  } catch (err) {
    console.error("[site-popup] admin get error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load popup");
  }
}

// PATCH /apis/admin/site-popup  (admin) — update settings
async function update(req, res) {
  try {
    const current = await ensureRow();
    const b = req.body || {};
    const cols = {};
    const fields = {};

    if (b.isEnabled !== undefined) cols.is_enabled = b.isEnabled ? 1 : 0;

    if (b.frequency !== undefined) {
      if (!FREQUENCIES.includes(b.frequency)) fields.frequency = "Choose a valid frequency";
      else cols.frequency = b.frequency;
    }

    if (b.delaySeconds !== undefined) {
      const n = Number(b.delaySeconds);
      if (!Number.isInteger(n) || n < 0 || n > 60) fields.delaySeconds = "Delay must be a whole number between 0 and 60";
      else cols.delay_seconds = n;
    }

    for (const [col, key, max] of [
      ["eyebrow", "eyebrow", 120],
      ["title_highlight", "titleHighlight", 160],
      ["title", "title", 255],
      ["location_city", "locationCity", 120],
      ["location_country", "locationCountry", 120],
      ["price_label", "priceLabel", 60],
      ["price", "price", 60],
      ["price_unit", "priceUnit", 40],
      ["badge_text", "badgeText", 120],
      ["button_text", "buttonText", 80],
    ]) {
      if (b[key] === undefined) continue;
      const v = b[key] == null ? "" : String(b[key]).trim();
      if (v.length > max) fields[key] = `Must be ≤ ${max} characters`;
      else cols[col] = v || null;
    }

    if (b.description !== undefined) {
      const v = b.description == null ? "" : String(b.description).trim();
      if (v.length > 1000) fields.description = "Must be ≤ 1000 characters";
      else cols.description = v || null;
    }

    for (const [col, key] of [
      ["show_from", "showFrom"],
      ["show_until", "showUntil"],
      ["start_date", "startDate"],
      ["end_date", "endDate"],
    ]) {
      if (b[key] === undefined) continue;
      const v = b[key] == null ? "" : String(b[key]).trim();
      if (!v) cols[col] = null;
      else if (!DATE_RE.test(v) || Number.isNaN(Date.parse(v))) fields[key] = "Enter a valid date";
      else cols[col] = v;
    }

    for (const [col, key, label] of [
      ["button_url", "buttonUrl", "Button link"],
      ["image", "image", "Image"],
    ]) {
      if (b[key] === undefined) continue;
      const v = b[key] == null ? "" : String(b[key]).trim();
      if (!v) cols[col] = null;
      else if (v.length > 500 || !SAFE_LINK_RE.test(v)) fields[key] = `${label} must be a relative path (/…) or an http(s):// URL (≤500 characters)`;
      else cols[col] = v;
    }

    // Cross-field date checks (compare against stored values when only one side is sent).
    const pick = (col) => (cols[col] !== undefined ? cols[col] : current[`${col}_s`]);
    const from = pick("show_from");
    const until = pick("show_until");
    const start = pick("start_date");
    const end = pick("end_date");
    if (!fields.showUntil && from && until && until < from) fields.showUntil = "“Show until” must be on or after “Show from”";
    if (!fields.endDate && start && end && end < start) fields.endDate = "End date must be on or after the start date";

    if (Object.keys(fields).length) return sendError(res, 422, "VALIDATION_ERROR", "One or more fields are invalid", fields);
    if (!Object.keys(cols).length) return sendError(res, 422, "VALIDATION_ERROR", "No updatable fields provided");

    const setClause = Object.keys(cols).map((c) => `${c} = ?`).join(", ");
    await query(`UPDATE site_popup SET ${setClause} WHERE id = 1`, Object.values(cols));

    const rows = await query(SELECT_ROW);
    return res.json({ data: mapRow(rows[0]) });
  } catch (err) {
    console.error("[site-popup] update error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not update popup");
  }
}

module.exports = { getPublic, getAdmin, update };
