const ExcelJS = require("exceljs");
const { query } = require("../config/db");
const { formatMoney } = require("../utils/money");
const { sendError } = require("../utils/http");

const SORT_FIELDS = { created_at: "created_at", status: "status", total_amount_cents: "total_amount_cents" };
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EXPORT_MAX_ROWS = 100000; // safety cap for a single export

/**
 * Build the shared WHERE clause + params from list/export query params
 * (status CSV, includeSpam, q search, dateFrom/dateTo). Always excludes deleted.
 */
function buildFilters(q) {
  const conditions = ["r.delete_status = 0"];
  const params = [];

  if (q.status) {
    const statuses = String(q.status).split(",").map((s) => s.trim()).filter(Boolean);
    if (statuses.length) {
      conditions.push(`r.status IN (${statuses.map(() => "?").join(", ")})`);
      params.push(...statuses);
    }
  }
  if (String(q.includeSpam) !== "true") {
    conditions.push("r.is_spam = 0");
  }
  if (q.q) {
    const like = `%${String(q.q).trim()}%`;
    conditions.push("(r.first_name LIKE ? OR r.last_name LIKE ? OR r.email LIKE ? OR r.organization LIKE ? OR r.reference_no LIKE ?)");
    params.push(like, like, like, like, like);
  }
  if (q.dateFrom && DATE_RE.test(q.dateFrom)) {
    conditions.push("r.created_at >= ?");
    params.push(`${q.dateFrom} 00:00:00`);
  }
  if (q.dateTo && DATE_RE.test(q.dateTo)) {
    conditions.push("r.created_at <= ?");
    params.push(`${q.dateTo} 23:59:59`);
  }
  return { where: `WHERE ${conditions.join(" AND ")}`, params };
}

/** Parse ?sort into a safe { field, dir } for registrations. */
function parseSort(sortRaw) {
  const raw = String(sortRaw || "-created_at");
  const dir = raw.startsWith("-") ? "DESC" : "ASC";
  const field = SORT_FIELDS[raw.replace(/^-/, "")] || "created_at";
  return { field, dir };
}

/** Map a registration DB row to the list/summary shape. */
function toSummary(r) {
  return {
    id: r.id,
    referenceNo: r.reference_no,
    firstName: r.first_name,
    lastName: r.last_name,
    email: r.email,
    phone: r.phone_dial_code ? `${r.phone_dial_code} ${r.phone_number}` : r.phone_number,
    country: r.country,
    organization: r.organization,
    status: r.status,
    isSpam: !!r.is_spam,
    currency: r.currency,
    totalAmountCents: r.total_amount_cents,
    totalAmountFormatted: formatMoney(r.total_amount_cents, r.currency),
    programCount: r.program_count,
    createdAt: r.created_at,
  };
}

/**
 * GET /apis/registrations   (admin, requires token)
 * Filters: status (CSV), q (search), dateFrom, dateTo, includeSpam, sort, page, pageSize.
 */
async function listRegistrations(req, res) {
  try {
    const { where, params } = buildFilters(req.query);
    const { field, dir } = parseSort(req.query.sort);

    // pagination
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 25));
    const offset = (page - 1) * pageSize;

    const countRows = await query(`SELECT COUNT(*) AS total FROM registrations r ${where}`, params);
    const total = countRows[0].total;

    const rows = await query(
      `SELECT r.id, r.reference_no, r.first_name, r.last_name, r.email,
              r.phone_dial_code, r.phone_number, r.country, r.organization,
              r.status, r.is_spam, r.currency, r.total_amount_cents, r.created_at,
              (SELECT COUNT(*) FROM registration_programs rp WHERE rp.registration_id = r.id) AS program_count
         FROM registrations r
         ${where}
         ORDER BY r.${field} ${dir}
         LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return res.json({
      data: rows.map(toSummary),
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 0 },
    });
  } catch (err) {
    console.error("[registrations] list error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load registrations");
  }
}

/**
 * GET /apis/registrations/:id   (admin, requires token)
 * Full detail incl. programmes and internal fields.
 */
async function getRegistration(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return sendError(res, 400, "BAD_REQUEST", "Invalid id");

    const rows = await query(
      `SELECT * FROM registrations WHERE id = ? AND delete_status = 0 LIMIT 1`,
      [id]
    );
    const r = rows[0];
    if (!r) return sendError(res, 404, "NOT_FOUND", "Registration not found");

    const items = await query(
      `SELECT program_slug, program_title, unit_price_cents, currency
         FROM registration_programs WHERE registration_id = ?`,
      [id]
    );

    return res.json({
      data: {
        id: r.id,
        referenceNo: r.reference_no,
        firstName: r.first_name,
        lastName: r.last_name,
        email: r.email,
        phoneCountry: r.phone_country,
        phoneDialCode: r.phone_dial_code,
        phoneNumber: r.phone_number,
        country: r.country,
        designation: r.designation,
        organization: r.organization,
        hearAboutUs: r.hear_about_us,
        currency: r.currency,
        totalAmountCents: r.total_amount_cents,
        totalAmountFormatted: formatMoney(r.total_amount_cents, r.currency),
        status: r.status,
        internalNotes: r.internal_notes,
        sourcePage: r.source_page,
        utm: { source: r.utm_source, medium: r.utm_medium, campaign: r.utm_campaign },
        ipAddress: r.ip_address,
        userAgent: r.user_agent,
        isSpam: !!r.is_spam,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        programs: items.map((i) => ({
          slug: i.program_slug,
          title: i.program_title,
          unitPriceCents: i.unit_price_cents,
          currency: i.currency,
        })),
      },
    });
  } catch (err) {
    console.error("[registrations] detail error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load registration");
  }
}

// Columns for the export (order matters). value(r) pulls from a joined row.
const EXPORT_COLUMNS = [
  { header: "Reference No", key: "reference_no", width: 18 },
  { header: "First Name", key: "first_name", width: 16 },
  { header: "Last Name", key: "last_name", width: 16 },
  { header: "Email", key: "email", width: 28 },
  { header: "Phone", key: "phone", width: 18, value: (r) => (r.phone_dial_code ? `${r.phone_dial_code} ${r.phone_number}` : r.phone_number) },
  { header: "Country", key: "country", width: 18 },
  { header: "Designation", key: "designation", width: 20 },
  { header: "Organisation", key: "organization", width: 24 },
  { header: "Heard About Us", key: "hear_about_us", width: 18 },
  { header: "Programmes", key: "programmes", width: 40, value: (r) => r.programmes || "" },
  { header: "Programme Count", key: "program_count", width: 15 },
  { header: "Currency", key: "currency", width: 10 },
  { header: "Total Amount", key: "total_amount", width: 14, value: (r) => (r.total_amount_cents || 0) / 100 },
  { header: "Status", key: "status", width: 12 },
  { header: "Spam", key: "spam", width: 8, value: (r) => (r.is_spam ? "Yes" : "No") },
  { header: "Source Page", key: "source_page", width: 26 },
  { header: "UTM Source", key: "utm_source", width: 14 },
  { header: "UTM Medium", key: "utm_medium", width: 14 },
  { header: "UTM Campaign", key: "utm_campaign", width: 16 },
  { header: "Submitted At (UTC)", key: "created_at", width: 22, value: (r) => (r.created_at ? new Date(r.created_at).toISOString() : "") },
];

/** Fetch all registrations matching the current filters, with programmes aggregated. */
async function fetchExportRows(reqQuery) {
  const { where, params } = buildFilters(reqQuery);
  const { field, dir } = parseSort(reqQuery.sort);
  return query(
    `SELECT r.*,
            (SELECT COUNT(*) FROM registration_programs rp WHERE rp.registration_id = r.id) AS program_count,
            (SELECT GROUP_CONCAT(rp.program_title ORDER BY rp.id SEPARATOR ', ')
               FROM registration_programs rp WHERE rp.registration_id = r.id) AS programmes
       FROM registrations r
       ${where}
       ORDER BY r.${field} ${dir}
       LIMIT ${EXPORT_MAX_ROWS}`,
    params
  );
}

function csvCell(v) {
  if (v == null) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * GET /apis/registrations/export   (admin, requires token)
 * Streams an .xlsx (default) or .csv (?format=csv) of all registrations matching
 * the same filters as the list endpoint (status, q, dateFrom, dateTo, includeSpam, sort).
 */
async function exportRegistrations(req, res) {
  try {
    const rows = await fetchExportRows(req.query);
    const stamp = new Date().toISOString().slice(0, 10);
    const format = String(req.query.format || "xlsx").toLowerCase();

    if (format === "csv") {
      const header = EXPORT_COLUMNS.map((c) => csvCell(c.header)).join(",");
      const lines = rows.map((r) =>
        EXPORT_COLUMNS.map((c) => csvCell(c.value ? c.value(r) : r[c.key])).join(",")
      );
      const csv = "﻿" + [header, ...lines].join("\r\n"); // BOM so Excel reads UTF-8
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="registrations-${stamp}.csv"`);
      return res.send(csv);
    }

    // Default: real .xlsx
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Registrations");
    ws.columns = EXPORT_COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width }));
    ws.getRow(1).font = { bold: true };
    ws.views = [{ state: "frozen", ySplit: 1 }]; // freeze header row

    for (const r of rows) {
      const record = {};
      for (const c of EXPORT_COLUMNS) record[c.key] = c.value ? c.value(r) : r[c.key];
      ws.addRow(record);
    }
    // format the money column as a number
    ws.getColumn("total_amount").numFmt = "#,##0.00";

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="registrations-${stamp}.xlsx"`);
    await wb.xlsx.write(res);
    return res.end();
  } catch (err) {
    console.error("[registrations] export error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not export registrations");
  }
}

module.exports = { listRegistrations, getRegistration, exportRegistrations };
