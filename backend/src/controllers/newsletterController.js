const ExcelJS = require("exceljs");
const { query } = require("../config/db");
const { sendError } = require("../utils/http");
const { sendMail } = require("../utils/mailer");

const EXPORT_MAX_ROWS = 100000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const STATUSES = ["subscribed", "unsubscribed"];

// Internal inbox notified of new subscriptions.
const NOTIFY_TO = process.env.MAIL_NOTIFY || "register@globalatd.com";

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

/** Escape a value for safe interpolation into notification-email HTML. */
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toSubscriber(r) {
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    status: r.status,
    sourcePage: r.source_page,
    ipAddress: r.ip_address,
    userAgent: r.user_agent,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/** Notify the internal inbox of a new subscription (best-effort, never throws). */
async function notifyNewSubscriber(value) {
  const subject = `New newsletter subscription — ${value.email}`;
  const text =
    `A new visitor subscribed to the GATD newsletter.\n\n` +
    `Email:       ${value.email}\n` +
    (value.name ? `Name:        ${value.name}\n` : "") +
    `Source page: ${value.sourcePage || "—"}\n`;
  const html =
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#414143;font-size:14px;line-height:1.6">` +
    `<h2 style="color:#D52029;margin:0 0 12px">New newsletter subscription</h2>` +
    `<table style="border-collapse:collapse">` +
    `<tr><td style="padding:2px 12px 2px 0;color:#888">Email</td><td><a href="mailto:${esc(value.email)}">${esc(value.email)}</a></td></tr>` +
    (value.name ? `<tr><td style="padding:2px 12px 2px 0;color:#888">Name</td><td>${esc(value.name)}</td></tr>` : "") +
    `<tr><td style="padding:2px 12px 2px 0;color:#888">Source page</td><td>${esc(value.sourcePage || "—")}</td></tr>` +
    `</table></div>`;
  await sendMail({ to: NOTIFY_TO, subject, text, html, replyTo: value.email });
}

/**
 * POST /apis/newsletter   (public)
 * Capture a footer newsletter subscription (email + optional name).
 */
async function createSubscription(req, res) {
  try {
    // Honeypot: hidden field bots fill. Accept-and-drop silently.
    if (typeof req.body.honeypot === "string" && req.body.honeypot.trim() !== "") {
      return res.status(201).json({ data: { received: true } });
    }

    const email = cleanStr(req.body.email).toLowerCase().replace(/\s+/g, "");
    if (!email || email.length > 255 || !EMAIL_RE.test(email)) {
      return sendError(res, 422, "VALIDATION_ERROR", "Please enter a valid email address", {
        email: "Must be a valid email address",
      });
    }
    const name = cleanStr(req.body.name);
    const value = {
      email,
      name: name && name.length <= 160 && NAME_RE.test(name) ? name : null,
    };
    const sourcePage = cleanStr(req.body.sourcePage);
    value.sourcePage = sourcePage && sourcePage.length <= 255 && !/\s/.test(sourcePage) ? sourcePage : null;

    const ip = (req.ip || "").slice(0, 45) || null;
    const userAgent = (req.headers["user-agent"] || "").toString() || null;

    let isNew = true;
    try {
      await query(
        `INSERT INTO newsletter_subscribers (email, name, status, source_page, ip_address, user_agent)
         VALUES (?, ?, 'subscribed', ?, ?, ?)`,
        [value.email, value.name, value.sourcePage, ip, userAgent]
      );
    } catch (e) {
      if (e && e.code === "ER_DUP_ENTRY") {
        // Already exists — revive if it was soft-deleted/unsubscribed, else idempotent no-op.
        const rows = await query(`SELECT id, delete_status, status FROM newsletter_subscribers WHERE email = ? LIMIT 1`, [value.email]);
        const existing = rows[0];
        if (existing && (existing.delete_status === 1 || existing.status !== "subscribed")) {
          await query(
            `UPDATE newsletter_subscribers
                SET delete_status = 0, status = 'subscribed',
                    name = COALESCE(?, name), source_page = COALESCE(?, source_page)
              WHERE id = ?`,
            [value.name, value.sourcePage, existing.id]
          );
        } else {
          isNew = false; // active subscriber re-submitting; don't re-notify
        }
      } else {
        throw e;
      }
    }

    // Notify internal inbox of genuinely new/revived subscriptions (fire-and-forget).
    if (isNew) {
      notifyNewSubscriber(value).catch((err) => console.error("[newsletter] email error:", err && err.message));
    }

    return res.status(201).json({ data: { received: true } });
  } catch (err) {
    console.error("[newsletter] create error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not subscribe. Please try again.");
  }
}

/** Shared WHERE builder for list + export. */
function buildFilters(q) {
  const conditions = ["delete_status = 0"];
  const params = [];

  if (q.status && STATUSES.includes(String(q.status))) {
    conditions.push("status = ?");
    params.push(String(q.status));
  }
  if (q.q) {
    const like = `%${String(q.q).trim()}%`;
    conditions.push("(email LIKE ? OR name LIKE ?)");
    params.push(like, like);
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

/** GET /apis/newsletter   (admin) — list with search/status/pagination. */
async function listSubscribers(req, res) {
  try {
    const { where, params } = buildFilters(req.query);
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 25));
    const offset = (page - 1) * pageSize;

    const countRows = await query(`SELECT COUNT(*) AS total FROM newsletter_subscribers ${where}`, params);
    const total = countRows[0].total;

    const rows = await query(
      `SELECT * FROM newsletter_subscribers ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return res.json({
      data: rows.map(toSubscriber),
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 0 },
    });
  } catch (err) {
    console.error("[newsletter] list error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load subscribers");
  }
}

/** GET /apis/newsletter/:id   (admin) */
async function getSubscriber(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return sendError(res, 400, "BAD_REQUEST", "Invalid id");
    const rows = await query(`SELECT * FROM newsletter_subscribers WHERE id = ? AND delete_status = 0 LIMIT 1`, [id]);
    if (!rows[0]) return sendError(res, 404, "NOT_FOUND", "Subscriber not found");
    return res.json({ data: toSubscriber(rows[0]) });
  } catch (err) {
    console.error("[newsletter] detail error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load subscriber");
  }
}

/** PATCH /apis/newsletter/:id   (admin) — update email / name / status. */
async function updateSubscriber(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return sendError(res, 400, "BAD_REQUEST", "Invalid id");

    const b = req.body || {};
    const cols = {};
    const fields = {};

    if (b.email !== undefined) {
      const email = cleanStr(b.email).toLowerCase().replace(/\s+/g, "");
      if (!email || email.length > 255 || !EMAIL_RE.test(email)) fields.email = "Must be a valid email address";
      else cols.email = email;
    }
    if (b.name !== undefined) {
      const name = cleanStr(b.name);
      if (name && (name.length > 160 || !NAME_RE.test(name))) fields.name = "Name contains invalid characters";
      else cols.name = name || null;
    }
    if (b.status !== undefined) {
      const status = cleanStr(b.status);
      if (!STATUSES.includes(status)) fields.status = `status must be one of: ${STATUSES.join(", ")}`;
      else cols.status = status;
    }

    if (Object.keys(fields).length) return sendError(res, 422, "VALIDATION_ERROR", "One or more fields are invalid", fields);
    if (!Object.keys(cols).length) return sendError(res, 422, "VALIDATION_ERROR", "No updatable fields provided");

    const setClause = Object.keys(cols).map((c) => `${c} = ?`).join(", ");
    try {
      const result = await query(
        `UPDATE newsletter_subscribers SET ${setClause} WHERE id = ? AND delete_status = 0`,
        [...Object.values(cols), id]
      );
      if (result.affectedRows === 0) return sendError(res, 404, "NOT_FOUND", "Subscriber not found");
    } catch (e) {
      if (e && e.code === "ER_DUP_ENTRY") {
        return sendError(res, 409, "CONFLICT", "Another subscriber already uses that email", { email: "Email already exists" });
      }
      throw e;
    }

    const rows = await query(`SELECT * FROM newsletter_subscribers WHERE id = ? LIMIT 1`, [id]);
    return res.json({ data: toSubscriber(rows[0]) });
  } catch (err) {
    console.error("[newsletter] update error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not update subscriber");
  }
}

/** DELETE /apis/newsletter/:id   (admin) — soft-delete a subscriber. */
async function deleteSubscriber(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return sendError(res, 400, "BAD_REQUEST", "Invalid id");
    const result = await query(
      `UPDATE newsletter_subscribers SET delete_status = 1 WHERE id = ? AND delete_status = 0`,
      [id]
    );
    if (result.affectedRows === 0) return sendError(res, 404, "NOT_FOUND", "Subscriber not found");
    return res.json({ data: { id, deleted: true } });
  } catch (err) {
    console.error("[newsletter] delete error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not delete subscriber");
  }
}

const EXPORT_COLUMNS = [
  { header: "Email", key: "email", width: 30 },
  { header: "Name", key: "name", width: 22 },
  { header: "Status", key: "status", width: 14 },
  { header: "Source Page", key: "source_page", width: 24 },
  { header: "Subscribed At (UTC)", key: "created_at", width: 22, value: (r) => (r.created_at ? new Date(r.created_at).toISOString() : "") },
];

function csvCell(v) {
  if (v == null) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Prevent CSV/spreadsheet formula injection: a value starting with =, +, -, @ (or
// a tab/CR) can be executed as a formula by Excel/Sheets. Prefix such values with a
// single quote so they render as literal text. (email/source_page are user-supplied.)
function neutralizeFormula(v) {
  if (typeof v !== "string") return v;
  return /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
}

/** GET /apis/newsletter/export   (admin) — .xlsx (default) or .csv. */
async function exportSubscribers(req, res) {
  try {
    const { where, params } = buildFilters(req.query);
    const rows = await query(
      `SELECT * FROM newsletter_subscribers ${where} ORDER BY created_at DESC LIMIT ${EXPORT_MAX_ROWS}`,
      params
    );
    const stamp = new Date().toISOString().slice(0, 10);
    const format = String(req.query.format || "xlsx").toLowerCase();

    if (format === "csv") {
      const header = EXPORT_COLUMNS.map((c) => csvCell(c.header)).join(",");
      const lines = rows.map((r) => EXPORT_COLUMNS.map((c) => csvCell(neutralizeFormula(c.value ? c.value(r) : r[c.key]))).join(","));
      const csv = "﻿" + [header, ...lines].join("\r\n");
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="newsletter-${stamp}.csv"`);
      return res.send(csv);
    }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Subscribers");
    ws.columns = EXPORT_COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width }));
    ws.getRow(1).font = { bold: true };
    ws.views = [{ state: "frozen", ySplit: 1 }];
    for (const r of rows) {
      const record = {};
      for (const c of EXPORT_COLUMNS) record[c.key] = neutralizeFormula(c.value ? c.value(r) : r[c.key]);
      ws.addRow(record);
    }

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="newsletter-${stamp}.xlsx"`);
    await wb.xlsx.write(res);
    return res.end();
  } catch (err) {
    console.error("[newsletter] export error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not export subscribers");
  }
}

module.exports = {
  createSubscription,
  listSubscribers,
  getSubscriber,
  updateSubscriber,
  deleteSubscriber,
  exportSubscribers,
  NEWSLETTER_STATUSES: STATUSES,
};
