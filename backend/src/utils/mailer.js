// Thin SMTP mailer around nodemailer, supporting more than one sending mailbox.
//
// Shared connection settings (both mailboxes live on the same cPanel host):
//   SMTP_HOST       e.g. mail.globalatd.com (on cPanel: localhost)
//   SMTP_PORT       465 (SSL) or 587 (STARTTLS); defaults to 587
//   SMTP_SECURE     "true" to force TLS-on-connect (auto-on for port 465)
//   SMTP_TLS_REJECT_UNAUTHORIZED  "false" to skip cert check (localhost loopback)
//
// Default account (registrations, contact, etc.):
//   SMTP_USER       the mailbox login, e.g. register@globalatd.com
//   SMTP_PASSWORD   the mailbox password
//   MAIL_FROM       From header (falls back to SMTP_USER)
//
// Brochure account (Brochure + Company Profile download emails) — kept separate
// so those messages send FROM brochure@globalatd.com without touching the
// register@globalatd.com flow:
//   SMTP_BROCHURE_USER      e.g. brochure@globalatd.com
//   SMTP_BROCHURE_PASSWORD  its mailbox password
//   MAIL_FROM_BROCHURE      From header (falls back to SMTP_BROCHURE_USER)
//
// If an account isn't configured the mailer logs a warning and (for non-default
// accounts) falls back to the default sender so mail still goes out. If nothing
// is configured it becomes a no-op, so the rest of the app keeps working.

const nodemailer = require("nodemailer");

// One transporter per account key, memoized. Value is a transporter or null
// (null = that account's SMTP credentials aren't configured).
const transporters = {};

/** Build a transporter from the shared connection vars + a mailbox login/pass. */
function buildTransporter(user, pass) {
  const { SMTP_HOST } = process.env;
  if (!SMTP_HOST || !user || !pass) return null;

  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  // On cPanel the app runs on the same box as the mail server, so the reliable
  // host is "localhost" — but its TLS cert won't match "localhost", so allow
  // opting out of cert verification for that trusted loopback connection:
  //   SMTP_TLS_REJECT_UNAUTHORIZED=false
  const rejectUnauthorized = String(process.env.SMTP_TLS_REJECT_UNAUTHORIZED) !== "false";
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: String(process.env.SMTP_SECURE) === "true" || port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized },
  });
}

/** Credentials + From header for an account key. */
function accountConfig(account) {
  if (account === "brochure") {
    return {
      user: process.env.SMTP_BROCHURE_USER,
      pass: process.env.SMTP_BROCHURE_PASSWORD,
      from: process.env.MAIL_FROM_BROCHURE || process.env.SMTP_BROCHURE_USER,
    };
  }
  return {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
  };
}

/** Build (once) and return the transporter for an account, or null if unconfigured. */
function getTransporter(account = "default") {
  if (transporters[account] !== undefined) return transporters[account];
  const cfg = accountConfig(account);
  const tx = buildTransporter(cfg.user, cfg.pass);
  if (!tx) {
    console.warn(`[mail] account "${account}" not configured (SMTP host/user/password missing).`);
  }
  transporters[account] = tx;
  return tx;
}

/** True when the given account's credentials are present (emails will send). */
function isMailConfigured(account = "default") {
  return getTransporter(account) !== null;
}

/**
 * Send one email. Never throws — on failure it logs and resolves, so callers can
 * fire-and-forget without risking an unhandled rejection or a failed request.
 * @param {{to:string|string[], subject:string, text?:string, html?:string, replyTo?:string, account?:string}} msg
 * @returns {Promise<boolean>} true if handed off to SMTP, false if skipped/failed
 */
async function sendMail({ to, subject, text, html, replyTo, account = "default" }) {
  let tx = getTransporter(account);
  let cfg = accountConfig(account);
  // If a dedicated account isn't configured, fall back to the default sender so
  // the message still goes out rather than being silently dropped.
  if (!tx && account !== "default") {
    tx = getTransporter("default");
    cfg = accountConfig("default");
    if (tx) console.warn(`[mail] account "${account}" unconfigured — sending via default sender instead.`);
  }
  if (!tx) return false;

  const from = cfg.from;
  try {
    await tx.sendMail({ from, to, subject, text, html, replyTo });
    return true;
  } catch (err) {
    console.error(`[mail] failed to send "${subject}" to ${to}:`, err.message);
    return false;
  }
}

module.exports = { sendMail, isMailConfigured };
