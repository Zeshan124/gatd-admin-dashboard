const ExcelJS = require("exceljs");
const { query } = require("../config/db");
const { sendError } = require("../utils/http");
const { sendBrochureEmails } = require("../utils/brochureEmails");
const { scoreSubmission } = require("../utils/spamFilter");

const EXPORT_MAX_ROWS = 100000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const SOURCE_TYPES = ["solution", "program", "company_profile", "video"];
const BROCHURE_STATUSES = ["new", "contacted", "archived"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Clean a value to a trimmed single-line string (control chars -> space). */
function cleanStr(v) {
  if (typeof v !== "string") return "";
  let out = "";
  for (const ch of v) {
    const code = ch.codePointAt(0);
    out += code < 32 || code === 127 ? " " : ch;
  }
  return out.replace(/\s+/g, " ").trim();
}

/** Validate + normalize a brochure-download submission. */
function validateLead(body = {}) {
  const errors = {};
  const value = {};

  const name = cleanStr(body.name);
  if (!name) errors.name = "Name is required";
  else if (name.length < 2 || name.length > 160) errors.name = "Name must be between 2 and 160 characters";
  else if (!NAME_RE.test(name)) errors.name = "Name contains invalid characters";
  value.name = name;

  const email = cleanStr(body.email).toLowerCase().replace(/\s+/g, "");
  if (!email) errors.email = "Email address is required";
  else if (email.length > 255 || !EMAIL_RE.test(email)) errors.email = "Must be a valid email address";
  value.email = email;

  const country = cleanStr(body.country);
  if (!country) errors.country = "Country is required";
  else if (country.length > 120) errors.country = "Country must be at most 120 characters";
  value.country = country || null;

  const organization = cleanStr(body.organization);
  if (organization && organization.length > 200) errors.organization = "Organisation must be at most 200 characters";
  value.organization = organization || null;

  // context (from the modal) — not user-editable, so coerce rather than error
  const sourceType = cleanStr(body.sourceType).toLowerCase();
  value.sourceType = SOURCE_TYPES.includes(sourceType) ? sourceType : "program";
  value.itemSlug = cleanStr(body.itemSlug).slice(0, 160) || null;
  value.itemTitle = cleanStr(body.itemTitle).slice(0, 255) || null;
  value.brochure = cleanStr(body.brochure).slice(0, 500) || null;

  const sourcePage = cleanStr(body.sourcePage);
  value.sourcePage = sourcePage && sourcePage.length <= 255 && !/\s/.test(sourcePage) ? sourcePage : null;

  return { valid: Object.keys(errors).length === 0, errors, value };
}

/**
 * POST /apis/brochure-leads   (public)
 * Capture a brochure-download lead (from a Solution or Program page).
 */
async function createLead(req, res) {
  try {
    if (typeof req.body.honeypot === "string" && req.body.honeypot.trim() !== "") {
      return res.status(201).json({ data: { received: true } });
    }

    const { valid, errors, value } = validateLead(req.body);
    if (!valid) return sendError(res, 422, "VALIDATION_ERROR", "One or more fields are invalid", errors);

    const ip = (req.ip || "").slice(0, 45) || null;
    const userAgent = (req.headers["user-agent"] || "").toString() || null;

    // --- Spam heuristics: MARK (not reject) suspicious leads; skip their emails. ---
    const sc = scoreSubmission({ name: value.name, email: value.email, organization: value.organization });
    let isSpam = sc.spam;
    if (!isSpam) {
      const dup = await query(
        `SELECT COUNT(*) AS n FROM brochure_leads
          WHERE delete_status = 0 AND created_at > (NOW() - INTERVAL 1 DAY) AND email = ?`,
        [value.email]
      );
      if (dup[0].n >= 8) isSpam = true; // downloads recur as a visitor browses; higher bar
    }
    if (isSpam) console.warn(`[brochure] flagged spam (${sc.reasons.join(", ") || "repeated"}) from ${value.email}`);

    const result = await query(
      `INSERT INTO brochure_leads
         (source_type, item_slug, item_title, brochure, name, email, country, organization,
          status, source_page, ip_address, user_agent, is_spam)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, ?)`,
      [
        value.sourceType, value.itemSlug, value.itemTitle, value.brochure,
        value.name, value.email, value.country, value.organization,
        value.sourcePage, ip, userAgent, isSpam ? 1 : 0,
      ]
    );

    // Fire-and-forget: confirm to the visitor + notify brochure@globalatd.com.
    // Never blocks or fails the request (sendBrochureEmails swallows all errors).
    // Skip for spam-flagged leads so bots don't trigger emails.
    if (!isSpam) {
      sendBrochureEmails({ value }).catch((e) =>
        console.error("[brochure] email error:", e && e.message)
      );
    }

    return res.status(201).json({ data: { id: result.insertId, received: true } });
  } catch (err) {
    console.error("[brochure] create error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not submit. Please try again.");
  }
}

function toLead(r) {
  return {
    id: r.id,
    sourceType: r.source_type,
    itemSlug: r.item_slug,
    itemTitle: r.item_title,
    brochure: r.brochure,
    name: r.name,
    email: r.email,
    country: r.country,
    organization: r.organization,
    status: r.status,
    isSpam: !!r.is_spam,
    sourcePage: r.source_page,
    ipAddress: r.ip_address,
    userAgent: r.user_agent,
    createdAt: r.created_at,
  };
}

/** Shared WHERE builder for list + export (type, status, includeSpam, q, dateFrom/dateTo). */
function buildFilters(q) {
  const conditions = ["delete_status = 0"];
  const params = [];

  if (q.sourceType && SOURCE_TYPES.includes(String(q.sourceType))) {
    conditions.push("source_type = ?");
    params.push(String(q.sourceType));
  }
  // Catalog filters (populated from the CMS). A brochure lead's item_slug is a
  // child_solution slug (type 'solution') or a solution_program slug (type
  // 'program'/'video'); resolve the hierarchy so each level narrows correctly.
  //   Solution filter    → parent_solutions.slug
  //   Program filter     → child_solutions.slug
  //   Sub Program filter → solution_programs.slug
  if (q.solution) {
    conditions.push(
      `(
        (source_type IN ('solution','video') AND item_slug IN (
          SELECT c.slug FROM child_solutions c JOIN parent_solutions p ON p.id = c.parent_solution_id
          WHERE p.slug = ? AND c.delete_status = 0))
        OR (source_type IN ('program','video') AND item_slug IN (
          SELECT sp.slug FROM solution_programs sp
            JOIN child_solutions c ON c.id = sp.child_solution_id
            JOIN parent_solutions p ON p.id = c.parent_solution_id
          WHERE p.slug = ? AND sp.delete_status = 0))
      )`
    );
    params.push(String(q.solution), String(q.solution));
  }
  if (q.program) {
    conditions.push(
      `(
        (source_type IN ('solution','video') AND item_slug = ?)
        OR (source_type IN ('program','video') AND item_slug IN (
          SELECT sp.slug FROM solution_programs sp JOIN child_solutions c ON c.id = sp.child_solution_id
          WHERE c.slug = ? AND sp.delete_status = 0))
      )`
    );
    params.push(String(q.program), String(q.program));
  }
  if (q.subprogram) {
    conditions.push("(source_type IN ('program','video') AND item_slug = ?)");
    params.push(String(q.subprogram));
  }
  if (q.status) {
    const statuses = String(q.status).split(",").map((s) => s.trim()).filter(Boolean);
    if (statuses.length) {
      conditions.push(`status IN (${statuses.map(() => "?").join(", ")})`);
      params.push(...statuses);
    }
  }
  if (String(q.includeSpam) !== "true") conditions.push("is_spam = 0");
  if (q.q) {
    const like = `%${String(q.q).trim()}%`;
    conditions.push("(name LIKE ? OR email LIKE ? OR organization LIKE ? OR item_title LIKE ?)");
    params.push(like, like, like, like);
  }
  if (q.dateFrom && DATE_RE.test(q.dateFrom)) {
    conditions.push("created_at >= ?");
    params.push(`${q.dateFrom} 00:00:00`);
  }
  if (q.dateTo && DATE_RE.test(q.dateTo)) {
    conditions.push("created_at <= ?");
    params.push(`${q.dateTo} 23:59:59`);
  }
  return { where: `WHERE ${conditions.join(" AND ")}`, params };
}

/**
 * GET /apis/brochure-leads   (admin, requires token)
 * Filters: sourceType, status, includeSpam, q, page, pageSize.
 */
async function listLeads(req, res) {
  try {
    const { where, params } = buildFilters(req.query);
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 25));
    const offset = (page - 1) * pageSize;

    const countRows = await query(`SELECT COUNT(*) AS total FROM brochure_leads ${where}`, params);
    const total = countRows[0].total;

    const rows = await query(
      `SELECT * FROM brochure_leads ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return res.json({
      data: rows.map(toLead),
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 0 },
    });
  } catch (err) {
    console.error("[brochure] list error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load brochure leads");
  }
}

/**
 * GET /apis/brochure-leads/facets   (admin, requires token)
 * The full CMS catalog for the filter dropdowns: all Solutions (parent_solutions),
 * Programs (child_solutions) and Sub Programs (solution_programs). Each Program/
 * Sub Program carries its parent slug so the UI can cascade if desired.
 */
async function facets(req, res) {
  try {
    const solutions = await query(
      `SELECT slug, title FROM parent_solutions WHERE delete_status = 0 ORDER BY sort_order ASC, title ASC`
    );
    const programs = await query(
      `SELECT c.slug, c.title, p.slug AS solution_slug
         FROM child_solutions c LEFT JOIN parent_solutions p ON p.id = c.parent_solution_id
        WHERE c.delete_status = 0 ORDER BY c.sort_order ASC, c.title ASC`
    );
    const subprograms = await query(
      `SELECT sp.slug, sp.title, c.slug AS program_slug
         FROM solution_programs sp LEFT JOIN child_solutions c ON c.id = sp.child_solution_id
        WHERE sp.delete_status = 0 ORDER BY sp.sort_order ASC, sp.title ASC`
    );
    return res.json({
      data: {
        solutions: solutions.map((r) => ({ slug: r.slug, label: r.title || r.slug })),
        programs: programs.map((r) => ({ slug: r.slug, title: r.title || r.slug, solutionSlug: r.solution_slug })),
        subprograms: subprograms.map((r) => ({ slug: r.slug, title: r.title || r.slug, programSlug: r.program_slug })),
      },
    });
  } catch (err) {
    console.error("[brochure] facets error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load filters");
  }
}

/** GET /apis/brochure-leads/:id  (admin) */
async function getLead(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return sendError(res, 400, "BAD_REQUEST", "Invalid id");
    const rows = await query(`SELECT * FROM brochure_leads WHERE id = ? AND delete_status = 0 LIMIT 1`, [id]);
    if (!rows[0]) return sendError(res, 404, "NOT_FOUND", "Lead not found");
    return res.json({ data: toLead(rows[0]) });
  } catch (err) {
    console.error("[brochure] detail error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load lead");
  }
}

/** PATCH /apis/brochure-leads/:id  (admin) — update status */
async function updateLead(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return sendError(res, 400, "BAD_REQUEST", "Invalid id");
    const status = typeof req.body.status === "string" ? req.body.status.trim() : "";
    if (!BROCHURE_STATUSES.includes(status)) {
      return sendError(res, 422, "VALIDATION_ERROR", "Invalid status", {
        status: `status must be one of: ${BROCHURE_STATUSES.join(", ")}`,
      });
    }
    const result = await query(`UPDATE brochure_leads SET status = ? WHERE id = ? AND delete_status = 0`, [status, id]);
    if (result.affectedRows === 0) return sendError(res, 404, "NOT_FOUND", "Lead not found");
    const rows = await query(`SELECT * FROM brochure_leads WHERE id = ? LIMIT 1`, [id]);
    return res.json({ data: toLead(rows[0]) });
  } catch (err) {
    console.error("[brochure] update error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not update lead");
  }
}

const EXPORT_COLUMNS = [
  { header: "Name", key: "name", width: 20 },
  { header: "Email", key: "email", width: 28 },
  { header: "Country", key: "country", width: 16 },
  { header: "Organisation", key: "organization", width: 24 },
  { header: "Type", key: "source_type", width: 12 },
  { header: "Item", key: "item_title", width: 34 },
  { header: "File / Link", key: "brochure", width: 30 },
  { header: "Status", key: "status", width: 12 },
  { header: "Spam", key: "spam", width: 8, value: (r) => (r.is_spam ? "Yes" : "No") },
  { header: "Source Page", key: "source_page", width: 24 },
  { header: "Received At (UTC)", key: "created_at", width: 22, value: (r) => (r.created_at ? new Date(r.created_at).toISOString() : "") },
];

function csvCell(v) {
  if (v == null) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** GET /apis/brochure-leads/export  (admin) — xlsx (default) or csv */
async function exportLeads(req, res) {
  try {
    const { where, params } = buildFilters(req.query);
    const rows = await query(
      `SELECT * FROM brochure_leads ${where} ORDER BY created_at DESC LIMIT ${EXPORT_MAX_ROWS}`,
      params
    );
    const stamp = new Date().toISOString().slice(0, 10);
    const format = String(req.query.format || "xlsx").toLowerCase();

    if (format === "csv") {
      const header = EXPORT_COLUMNS.map((c) => csvCell(c.header)).join(",");
      const lines = rows.map((r) => EXPORT_COLUMNS.map((c) => csvCell(c.value ? c.value(r) : r[c.key])).join(","));
      const csv = "﻿" + [header, ...lines].join("\r\n");
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="brochure-leads-${stamp}.csv"`);
      return res.send(csv);
    }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Brochure Leads");
    ws.columns = EXPORT_COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width }));
    ws.getRow(1).font = { bold: true };
    ws.views = [{ state: "frozen", ySplit: 1 }];
    for (const r of rows) {
      const record = {};
      for (const c of EXPORT_COLUMNS) record[c.key] = c.value ? c.value(r) : r[c.key];
      ws.addRow(record);
    }

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="brochure-leads-${stamp}.xlsx"`);
    await wb.xlsx.write(res);
    return res.end();
  } catch (err) {
    console.error("[brochure] export error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not export brochure leads");
  }
}

/**
 * DELETE /apis/brochure-leads/:id   (admin, requires token)
 * Soft-delete a lead (hidden from lists/exports; row retained).
 */
async function deleteLead(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return sendError(res, 400, "BAD_REQUEST", "Invalid id");
    const result = await query(
      `UPDATE brochure_leads SET delete_status = 1 WHERE id = ? AND delete_status = 0`,
      [id]
    );
    if (result.affectedRows === 0) return sendError(res, 404, "NOT_FOUND", "Lead not found");
    return res.json({ data: { id, deleted: true } });
  } catch (err) {
    console.error("[brochure] delete error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not delete lead");
  }
}

module.exports = { createLead, listLeads, facets, getLead, updateLead, deleteLead, exportLeads, BROCHURE_STATUSES, SOURCE_TYPES };
