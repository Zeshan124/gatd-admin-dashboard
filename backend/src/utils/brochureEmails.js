// Composes + sends the two emails triggered by a Brochure or Company Profile
// download form:
//   1. a confirmation to the visitor (with the download link), and
//   2. a notification to the internal inbox (MAIL_NOTIFY_BROCHURE, default
//      brochure@globalatd.com).
//
// Both send FROM the dedicated brochure@globalatd.com mailbox (account:
// "brochure" — see mailer.js) so the register@globalatd.com flow is untouched.
//
// Everything here is best-effort: sendMail never throws, and callers should
// fire-and-forget so email latency/outages never affect the API response.

const { sendMail } = require("./mailer");

const NOTIFY_TO = process.env.MAIL_NOTIFY_BROCHURE || "brochure@globalatd.com";
// Base URL used to turn a stored relative path (e.g. /brochures/x.pdf or an
// /uploads/… path) into a clickable absolute link in the confirmation email.
const SITE_URL = (process.env.PUBLIC_SITE_URL || "https://globalatd.com").replace(/\/+$/, "");

/** Escape a value for safe interpolation into HTML. */
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Turn a stored brochure path into an absolute URL for the email. */
function absoluteUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Fire both emails for a newly-captured brochure/company-profile lead.
 * @param {object} args
 * @param {object} args.value  normalized lead values from validateLead
 *   ({ name, email, country, organization, sourceType, itemTitle, brochure, sourcePage })
 */
async function sendBrochureEmails({ value }) {
  const isCompany = value.sourceType === "company_profile";
  const kind = isCompany ? "Company Profile" : "Brochure";
  const itemTitle = value.itemTitle || (isCompany ? "Company Profile" : "Brochure");
  const downloadUrl = absoluteUrl(value.brochure);
  const firstName = (value.name || "").trim().split(/\s+/)[0] || "there";

  // 1) Confirmation to the visitor -------------------------------------------
  const userSubject = isCompany
    ? "Your GATD Company Profile is ready to download"
    : `Your requested brochure — ${itemTitle}`;
  const intro = isCompany
    ? `Thank you for your interest in Global Academy for Training & Development (GATD). ` +
      `Your copy of our company profile is ready to download below.`
    : `Thank you for your interest in "${itemTitle}". Your brochure is ready to download below.`;
  const userText =
    `Dear ${firstName},\n\n` +
    `${intro}\n\n` +
    (downloadUrl ? `Download: ${downloadUrl}\n\n` : "") +
    `If you have any questions, simply reply to this email and our team will be happy to help.\n\n` +
    `Warm regards,\nThe GATD Team`;
  const userHtml =
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#414143;font-size:14px;line-height:1.6">` +
    `<p>Dear ${esc(firstName)},</p>` +
    `<p>${esc(intro)}</p>` +
    (downloadUrl
      ? `<p style="margin:20px 0"><a href="${esc(downloadUrl)}" ` +
        `style="display:inline-block;background:#D52029;color:#fff;text-decoration:none;` +
        `font-weight:bold;padding:12px 22px;border-radius:8px">Download ${esc(kind)}</a></p>` +
        `<p style="font-size:12px;color:#888">If the button doesn't work, copy this link into your browser:<br>` +
        `<a href="${esc(downloadUrl)}">${esc(downloadUrl)}</a></p>`
      : "") +
    `<p>If you have any questions, simply reply to this email and our team will be happy to help.</p>` +
    `<p>Warm regards,<br>The GATD Team</p></div>`;

  // 2) Internal notification --------------------------------------------------
  const adminSubject = `New ${kind} download — ${value.name || value.email}`;
  const adminText =
    `A new ${kind.toLowerCase()} download form has been submitted.\n\n` +
    `Type:         ${kind}\n` +
    `Item:         ${itemTitle}\n` +
    `Name:         ${value.name || "—"}\n` +
    `Email:        ${value.email}\n` +
    `Country:      ${value.country || "—"}\n` +
    `Organisation: ${value.organization || "—"}\n` +
    `Source page:  ${value.sourcePage || "—"}\n` +
    (downloadUrl ? `File:         ${downloadUrl}\n` : "");
  const adminHtml =
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#414143;font-size:14px;line-height:1.6">` +
    `<h2 style="color:#D52029;margin:0 0 12px">New ${esc(kind)} download</h2>` +
    `<table style="border-collapse:collapse">` +
    `<tr><td style="padding:2px 12px 2px 0;color:#888">Type</td><td>${esc(kind)}</td></tr>` +
    `<tr><td style="padding:2px 12px 2px 0;color:#888">Item</td><td>${esc(itemTitle)}</td></tr>` +
    `<tr><td style="padding:2px 12px 2px 0;color:#888">Name</td><td>${esc(value.name || "—")}</td></tr>` +
    `<tr><td style="padding:2px 12px 2px 0;color:#888">Email</td><td><a href="mailto:${esc(value.email)}">${esc(value.email)}</a></td></tr>` +
    `<tr><td style="padding:2px 12px 2px 0;color:#888">Country</td><td>${esc(value.country || "—")}</td></tr>` +
    `<tr><td style="padding:2px 12px 2px 0;color:#888">Organisation</td><td>${esc(value.organization || "—")}</td></tr>` +
    `<tr><td style="padding:2px 12px 2px 0;color:#888">Source page</td><td>${esc(value.sourcePage || "—")}</td></tr>` +
    (downloadUrl
      ? `<tr><td style="padding:2px 12px 2px 0;color:#888">File</td><td><a href="${esc(downloadUrl)}">${esc(downloadUrl)}</a></td></tr>`
      : "") +
    `</table></div>`;

  await Promise.all([
    sendMail({ to: value.email, subject: userSubject, text: userText, html: userHtml, replyTo: NOTIFY_TO, account: "brochure" }),
    sendMail({ to: NOTIFY_TO, subject: adminSubject, text: adminText, html: adminHtml, replyTo: value.email, account: "brochure" }),
  ]);
}

module.exports = { sendBrochureEmails };
