// Composes + sends the two emails triggered by a new program registration:
//   1. a confirmation to the registrant (the address they entered), and
//   2. a notification to the internal inbox (MAIL_NOTIFY, default
//      register@globalatd.com).
//
// Everything here is best-effort: sendMail never throws, and callers should
// fire-and-forget so email latency/outages never affect the API response.

const { sendMail } = require("./mailer");
const { formatMoney } = require("./money");

const NOTIFY_TO = process.env.MAIL_NOTIFY || "register@globalatd.com";

/** Escape a value for safe interpolation into HTML. */
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Render the selected programmes as plain-text and HTML rows. */
function renderPrograms(programs, currency) {
  const text = programs
    .map((p) => `  • ${p.title} — ${formatMoney(p.price_cents, currency)}`)
    .join("\n");
  const html = programs
    .map(
      (p) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${esc(p.title)}</td>` +
        `<td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">${esc(
          formatMoney(p.price_cents, currency)
        )}</td></tr>`
    )
    .join("");
  return { text, html };
}

/**
 * Fire both emails for a newly-created registration.
 * @param {object} args
 * @param {object} args.value      normalized form values (firstName, email, …)
 * @param {string} args.dialCode   e.g. "+92"
 * @param {string} args.referenceNo
 * @param {Array}  args.programs   [{ title, price_cents }]
 * @param {string} args.currency
 * @param {number} args.totalAmountCents
 */
async function sendRegistrationEmails({ value, dialCode, referenceNo, programs, currency, totalAmountCents }) {
  const fullName = [value.firstName, value.lastName].filter(Boolean).join(" ");
  const totalStr = formatMoney(totalAmountCents, currency);
  const rows = renderPrograms(programs, currency);
  const phone = value.phoneNumber ? `${dialCode || ""} ${value.phoneNumber}`.trim() : "—";

  // 1) Confirmation to the registrant ------------------------------------------
  const userSubject = "We've received your registration — GATD";
  const userText =
    `Dear ${value.firstName},\n\n` +
    `Thank you for registering with Global Academy for Training & Development (GATD). ` +
    `We've received your registration and our team will be in touch with you shortly.\n\n` +
    `Reference number: ${referenceNo}\n\n` +
    `Programme(s):\n${rows.text}\n\n` +
    `Total: ${totalStr}\n\n` +
    `If you have any questions, simply reply to this email.\n\n` +
    `Warm regards,\nThe GATD Team`;
  const userHtml =
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#414143;font-size:14px;line-height:1.6">` +
    `<p>Dear ${esc(value.firstName)},</p>` +
    `<p>Thank you for registering with <strong>Global Academy for Training &amp; Development (GATD)</strong>. ` +
    `We've received your registration and our team will be in touch with you shortly.</p>` +
    `<p style="margin:16px 0 4px"><span style="color:#888">Reference number</span><br><strong>${esc(referenceNo)}</strong></p>` +
    `<table style="border-collapse:collapse;width:100%;max-width:520px;margin:12px 0">` +
    `<thead><tr><th style="text-align:left;padding:6px 12px;border-bottom:2px solid #D52029">Programme</th>` +
    `<th style="text-align:right;padding:6px 12px;border-bottom:2px solid #D52029">Fee</th></tr></thead>` +
    `<tbody>${rows.html}</tbody>` +
    `<tfoot><tr><td style="padding:8px 12px;font-weight:bold">Total</td>` +
    `<td style="padding:8px 12px;text-align:right;font-weight:bold">${esc(totalStr)}</td></tr></tfoot>` +
    `</table>` +
    `<p>If you have any questions, simply reply to this email.</p>` +
    `<p>Warm regards,<br>The GATD Team</p></div>`;

  // 2) Internal notification ---------------------------------------------------
  const adminSubject = `New registration ${referenceNo} — ${fullName || value.email}`;
  const adminText =
    `A new program registration has been submitted.\n\n` +
    `Reference: ${referenceNo}\n` +
    `Name:      ${fullName || "—"}\n` +
    `Email:     ${value.email}\n` +
    `Phone:     ${phone}\n` +
    `Country:   ${value.country || "—"}\n` +
    `Designation: ${value.designation || "—"}\n` +
    `Organisation: ${value.organization || "—"}\n` +
    `Heard via: ${value.hearAboutUs || "—"}\n` +
    `Source:    ${value.sourcePage || "—"}\n\n` +
    `Programme(s):\n${rows.text}\n\n` +
    `Total: ${totalStr}`;
  const adminHtml =
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#414143;font-size:14px;line-height:1.6">` +
    `<h2 style="color:#D52029;margin:0 0 12px">New program registration</h2>` +
    `<table style="border-collapse:collapse">` +
    `<tr><td style="padding:2px 12px 2px 0;color:#888">Reference</td><td><strong>${esc(referenceNo)}</strong></td></tr>` +
    `<tr><td style="padding:2px 12px 2px 0;color:#888">Name</td><td>${esc(fullName || "—")}</td></tr>` +
    `<tr><td style="padding:2px 12px 2px 0;color:#888">Email</td><td><a href="mailto:${esc(value.email)}">${esc(value.email)}</a></td></tr>` +
    `<tr><td style="padding:2px 12px 2px 0;color:#888">Phone</td><td>${esc(phone)}</td></tr>` +
    `<tr><td style="padding:2px 12px 2px 0;color:#888">Country</td><td>${esc(value.country || "—")}</td></tr>` +
    `<tr><td style="padding:2px 12px 2px 0;color:#888">Designation</td><td>${esc(value.designation || "—")}</td></tr>` +
    `<tr><td style="padding:2px 12px 2px 0;color:#888">Organisation</td><td>${esc(value.organization || "—")}</td></tr>` +
    `<tr><td style="padding:2px 12px 2px 0;color:#888">Heard via</td><td>${esc(value.hearAboutUs || "—")}</td></tr>` +
    `<tr><td style="padding:2px 12px 2px 0;color:#888">Source page</td><td>${esc(value.sourcePage || "—")}</td></tr>` +
    `</table>` +
    `<table style="border-collapse:collapse;width:100%;max-width:520px;margin:12px 0">` +
    `<thead><tr><th style="text-align:left;padding:6px 12px;border-bottom:2px solid #D52029">Programme</th>` +
    `<th style="text-align:right;padding:6px 12px;border-bottom:2px solid #D52029">Fee</th></tr></thead>` +
    `<tbody>${rows.html}</tbody>` +
    `<tfoot><tr><td style="padding:8px 12px;font-weight:bold">Total</td>` +
    `<td style="padding:8px 12px;text-align:right;font-weight:bold">${esc(totalStr)}</td></tr></tfoot>` +
    `</table></div>`;

  await Promise.all([
    sendMail({ to: value.email, subject: userSubject, text: userText, html: userHtml, replyTo: NOTIFY_TO }),
    sendMail({ to: NOTIFY_TO, subject: adminSubject, text: adminText, html: adminHtml, replyTo: value.email }),
  ]);
}

module.exports = { sendRegistrationEmails };
