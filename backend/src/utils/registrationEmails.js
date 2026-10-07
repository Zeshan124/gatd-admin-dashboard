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

// Legal footer (company details + confidentiality disclaimer) appended to every
// registration email.
const DISCLAIMER =
  "This email and any attachments may contain confidential information and are intended solely for the designated recipient. " +
  "If you have received this communication in error, please notify the sender promptly and delete it from your system. " +
  "Any unauthorised disclosure, copying, distribution, or use of its contents is prohibited. " +
  "Views expressed are those of the sender and do not necessarily represent the official position of the GATD. " +
  "This communication is not contractually binding unless expressly stated and issued by an authorised GATD representative. " +
  "While reasonable precautions have been taken to protect this email and its attachments from viruses or malicious content, " +
  "recipients are advised to perform their own security checks before opening any attachments.";

const FOOTER_TEXT =
  `\n\n--\n` +
  `Global Association for Training & Development (GATD) | UEN No.: 202400505K\n` +
  `Registered Office Address: 100 Jalan Sultan, #09-06, Sultan Plaza, Singapore 199001.\n\n` +
  DISCLAIMER;

const FOOTER_HTML =
  `<div style="margin-top:28px;padding-top:16px;border-top:1px solid #e5e5e5;font-size:12px;line-height:1.6;color:#6b6b6d">` +
  `<p style="margin:0 0 4px">Global Association for Training &amp; Development (GATD) | <strong>UEN No.:</strong> 202400505K</p>` +
  `<p style="margin:0 0 12px"><strong>Registered Office Address:</strong> 100 Jalan Sultan, #09-06, Sultan Plaza, Singapore 199001.</p>` +
  `<p style="margin:0;font-size:11px;color:#8a8a8c">${esc(DISCLAIMER)}</p>` +
  `</div>`;

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
 * Build (but don't send) both emails for a registration.
 * Returns { user: { subject, text, html }, admin: { subject, text, html } }.
 * @param {object} args
 * @param {object} args.value      normalized form values (firstName, email, …)
 * @param {string} args.dialCode   e.g. "+92"
 * @param {string} args.referenceNo
 * @param {Array}  args.programs   [{ title, price_cents }]
 * @param {string} args.currency
 * @param {number} args.totalAmountCents
 */
function buildRegistrationEmails({ value, dialCode, referenceNo, programs, currency, totalAmountCents }) {
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
    `Warm regards,\nThe GATD Team` +
    FOOTER_TEXT;
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
    `<p>Warm regards,<br>The GATD Team</p>` +
    FOOTER_HTML +
    `</div>`;

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
    `Total: ${totalStr}` +
    FOOTER_TEXT;
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
    `</table>` +
    FOOTER_HTML +
    `</div>`;

  return {
    user: { subject: userSubject, text: userText, html: userHtml },
    admin: { subject: adminSubject, text: adminText, html: adminHtml },
  };
}

/** Fire both emails for a newly-created registration (same args as buildRegistrationEmails). */
async function sendRegistrationEmails(args) {
  const { user, admin } = buildRegistrationEmails(args);
  await Promise.all([
    sendMail({ to: args.value.email, ...user, replyTo: NOTIFY_TO }),
    sendMail({ to: NOTIFY_TO, ...admin, replyTo: args.value.email }),
  ]);
}

module.exports = { buildRegistrationEmails, sendRegistrationEmails };
