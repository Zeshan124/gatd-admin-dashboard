// Thin SMTP mailer around nodemailer.
//
// Configured entirely from env vars so no credentials live in code:
//   SMTP_HOST       e.g. mail.globalatd.com
//   SMTP_PORT       465 (SSL) or 587 (STARTTLS); defaults to 587
//   SMTP_SECURE     "true" to force TLS-on-connect (auto-on for port 465)
//   SMTP_USER       the mailbox login, e.g. register@globalatd.com
//   SMTP_PASSWORD   the mailbox password
//   MAIL_FROM       From header, e.g. "GATD <register@globalatd.com>"
//                   (falls back to SMTP_USER)
//
// If SMTP isn't configured the mailer becomes a no-op that logs a warning, so
// the rest of the app (e.g. saving a registration) keeps working regardless.

const nodemailer = require("nodemailer");

let transporter; // memoized; `null` once we've determined SMTP is unconfigured

/** Build (once) and return the nodemailer transport, or null if unconfigured. */
function getTransporter() {
  if (transporter !== undefined) return transporter;

  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    console.warn("[mail] SMTP_HOST/SMTP_USER/SMTP_PASSWORD not set — emails are disabled.");
    transporter = null;
    return transporter;
  }

  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  // On cPanel the app runs on the same box as the mail server, so the reliable
  // host is "localhost" — but its TLS cert won't match "localhost", so allow
  // opting out of cert verification for that trusted loopback connection:
  //   SMTP_TLS_REJECT_UNAUTHORIZED=false
  const rejectUnauthorized = String(process.env.SMTP_TLS_REJECT_UNAUTHORIZED) !== "false";
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: String(process.env.SMTP_SECURE) === "true" || port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    tls: { rejectUnauthorized },
  });
  return transporter;
}

/** True when SMTP credentials are present (emails will actually be sent). */
function isMailConfigured() {
  return getTransporter() !== null;
}

/**
 * Send one email. Never throws — on failure it logs and resolves, so callers can
 * fire-and-forget without risking an unhandled rejection or a failed request.
 * @param {{to:string|string[], subject:string, text?:string, html?:string, replyTo?:string}} msg
 * @returns {Promise<boolean>} true if handed off to SMTP, false if skipped/failed
 */
async function sendMail({ to, subject, text, html, replyTo }) {
  const tx = getTransporter();
  if (!tx) return false;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  try {
    await tx.sendMail({ from, to, subject, text, html, replyTo });
    return true;
  } catch (err) {
    console.error(`[mail] failed to send "${subject}" to ${to}:`, err.message);
    return false;
  }
}

module.exports = { sendMail, isMailConfigured };
