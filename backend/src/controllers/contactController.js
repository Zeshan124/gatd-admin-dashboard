const ExcelJS = require("exceljs");
const { query } = require("../config/db");
const { dialCodeFor, isSupportedCountry } = require("../utils/countries");
const { sendError } = require("../utils/http");

const EXPORT_MAX_ROWS = 100000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;

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

/** Validate + normalize a contact submission. Returns { valid, errors, value }. */
function validateContact(body = {}) {
  const errors = {};
  const value = {};

  const firstName = cleanStr(body.firstName);
  if (!firstName) errors.firstName = "Name is required";
  else if (firstName.length < 2 || firstName.length > 120) errors.firstName = "Name must be between 2 and 120 characters";
  else if (!NAME_RE.test(firstName)) errors.firstName = "Name contains invalid characters";
  value.firstName = firstName;

  const email = cleanStr(body.email).toLowerCase().replace(/\s+/g, "");
  if (!email) errors.email = "Email address is required";
  else if (email.length > 255 || !EMAIL_RE.test(email)) errors.email = "Must be a valid email address";
  value.email = email;

  // message required
  const message = cleanStr(body.message);
  if (!message) errors.message = "Message is required";
  else if (message.length > 5000) errors.message = "Message must be at most 5000 characters";
  value.message = message;

  // subject optional
  const subject = cleanStr(body.subject);
  if (subject && subject.length > 255) errors.subject = "Subject must be at most 255 characters";
  value.subject = subject || null;

  // phone optional; if a number is given, validate + derive dial code from country
  const phoneRaw = cleanStr(body.phoneNumber);
  const phoneCountry = cleanStr(body.phoneCountry).toUpperCase();
  if (phoneRaw) {
    if (!/^[\d\s()+-]{4,20}$/.test(phoneRaw)) errors.phoneNumber = "Phone number is invalid";
    if (phoneCountry && !isSupportedCountry(phoneCountry)) errors.phoneCountry = "Unsupported country code";
    value.phoneNumber = phoneRaw.replace(/\D/g, "");
    value.phoneCountry = phoneCountry && isSupportedCountry(phoneCountry) ? phoneCountry : null;
    value.phoneDialCode = value.phoneCountry ? dialCodeFor(value.phoneCountry) : null;
  } else {
    value.phoneNumber = null;
    value.phoneCountry = null;
    value.phoneDialCode = null;
  }

  // sourcePage optional
  const sourcePage = cleanStr(body.sourcePage);
  value.sourcePage = sourcePage && sourcePage.length <= 255 && !/\s/.test(sourcePage) ? sourcePage : null;

  return { valid: Object.keys(errors).length === 0, errors, value };
}

/**
 * POST /apis/contact   (public)
 * Capture a "Get In Touch" contact-form submission.
 */
async function createContact(req, res) {
  try {
    // Honeypot: hidden field bots fill. Accept-and-drop silently.
    if (typeof req.body.honeypot === "string" && req.body.honeypot.trim() !== "") {
      return res.status(201).json({ data: { received: true } });
    }

    const { valid, errors, value } = validateContact(req.body);
    if (!valid) return sendError(res, 422, "VALIDATION_ERROR", "One or more fields are invalid", errors);

    const ip = (req.ip || "").slice(0, 45) || null;
    const userAgent = (req.headers["user-agent"] || "").toString() || null;

    const result = await query(
      `INSERT INTO contact_messages
         (first_name, email, phone_country, phone_dial_code, phone_number, subject, message,
          status, source_page, ip_address, user_agent, is_spam)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, 0)`,
      [
        value.firstName, value.email, value.phoneCountry, value.phoneDialCode, value.phoneNumber,
        value.subject, value.message, value.sourcePage, ip, userAgent,
      ]
    );

    return res.status(201).json({ data: { id: result.insertId, received: true } });
  } catch (err) {
    console.error("[contact] create error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not send your message. Please try again.");
  }
}

/** Map a DB row to the admin API shape. */
function toMessage(r) {
  return {
    id: r.id,
    firstName: r.first_name,
    email: r.email,
    phone: r.phone_dial_code ? `${r.phone_dial_code} ${r.phone_number}` : r.phone_number,
    phoneCountry: r.phone_country,
    subject: r.subject,
    message: r.message,
    status: r.status,
    isSpam: !!r.is_spam,
    sourcePage: r.source_page,
    ipAddress: r.ip_address,
    userAgent: r.user_agent,
    createdAt: r.created_at,
  };
}

/**
 * Build the shared WHERE clause + params from list/export query params
 * (status CSV, includeSpam, q search). Always excludes soft-deleted rows.
 */
function buildFilters(q) {
  const conditions = ["delete_status = 0"];
  const params = [];

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
    conditions.push("(first_name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)");
    params.push(like, like, like, like);
  }
  return { where: `WHERE ${conditions.join(" AND ")}`, params };
}

/**
 * GET /apis/contact   (admin, requires token)
 * List messages with search / status filter / pagination.
 */
async function listContact(req, res) {
  try {
    const { where, params } = buildFilters(req.query);
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 25));
    const offset = (page - 1) * pageSize;

    const countRows = await query(`SELECT COUNT(*) AS total FROM contact_messages ${where}`, params);
    const total = countRows[0].total;

    const rows = await query(
      `SELECT * FROM contact_messages ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return res.json({
      data: rows.map(toMessage),
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 0 },
    });
  } catch (err) {
    console.error("[contact] list error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load messages");
  }
}

/**
 * GET /apis/contact/:id   (admin, requires token)
 */
async function getContact(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return sendError(res, 400, "BAD_REQUEST", "Invalid id");
    const rows = await query(`SELECT * FROM contact_messages WHERE id = ? AND delete_status = 0 LIMIT 1`, [id]);
    if (!rows[0]) return sendError(res, 404, "NOT_FOUND", "Message not found");
    return res.json({ data: toMessage(rows[0]) });
  } catch (err) {
    console.error("[contact] detail error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load message");
  }
}

const MESSAGE_STATUSES = ["new", "read", "replied", "archived"];

/**
 * PATCH /apis/contact/:id   (admin, requires token)
 * Update a message's status (new | read | replied | archived).
 */
async function updateContact(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return sendError(res, 400, "BAD_REQUEST", "Invalid id");

    const status = typeof req.body.status === "string" ? req.body.status.trim() : "";
    if (!MESSAGE_STATUSES.includes(status)) {
      return sendError(res, 422, "VALIDATION_ERROR", "Invalid status", {
        status: `status must be one of: ${MESSAGE_STATUSES.join(", ")}`,
      });
    }

    const result = await query(
      `UPDATE contact_messages SET status = ? WHERE id = ? AND delete_status = 0`,
      [status, id]
    );
    if (result.affectedRows === 0) return sendError(res, 404, "NOT_FOUND", "Message not found");

    const rows = await query(`SELECT * FROM contact_messages WHERE id = ? LIMIT 1`, [id]);
    return res.json({ data: toMessage(rows[0]) });
  } catch (err) {
    console.error("[contact] update error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not update message");
  }
}

// Columns for the export (order matters).
const EXPORT_COLUMNS = [
  { header: "Name", key: "first_name", width: 20 },
  { header: "Email", key: "email", width: 28 },
  { header: "Phone", key: "phone", width: 18, value: (r) => (r.phone_dial_code ? `${r.phone_dial_code} ${r.phone_number}` : r.phone_number) },
  { header: "Subject", key: "subject", width: 26 },
  { header: "Message", key: "message", width: 60 },
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

/**
 * GET /apis/contact/export   (admin, requires token)
 * Streams an .xlsx (default) or .csv (?format=csv) of all messages matching the
 * same filters as the list (status, q, includeSpam).
 */
async function exportContact(req, res) {
  try {
    const { where, params } = buildFilters(req.query);
    const rows = await query(
      `SELECT * FROM contact_messages ${where} ORDER BY created_at DESC LIMIT ${EXPORT_MAX_ROWS}`,
      params
    );
    const stamp = new Date().toISOString().slice(0, 10);
    const format = String(req.query.format || "xlsx").toLowerCase();

    if (format === "csv") {
      const header = EXPORT_COLUMNS.map((c) => csvCell(c.header)).join(",");
      const lines = rows.map((r) => EXPORT_COLUMNS.map((c) => csvCell(c.value ? c.value(r) : r[c.key])).join(","));
      const csv = "﻿" + [header, ...lines].join("\r\n"); // BOM so Excel reads UTF-8
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="messages-${stamp}.csv"`);
      return res.send(csv);
    }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Messages");
    ws.columns = EXPORT_COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width }));
    ws.getRow(1).font = { bold: true };
    ws.views = [{ state: "frozen", ySplit: 1 }];
    for (const r of rows) {
      const record = {};
      for (const c of EXPORT_COLUMNS) record[c.key] = c.value ? c.value(r) : r[c.key];
      ws.addRow(record);
    }

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="messages-${stamp}.xlsx"`);
    await wb.xlsx.write(res);
    return res.end();
  } catch (err) {
    console.error("[contact] export error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not export messages");
  }
}

module.exports = { createContact, listContact, getContact, updateContact, exportContact, MESSAGE_STATUSES };
