// Heuristic spam scoring for public form submissions.
//
// Suspicious submissions are MARKED (is_spam = 1) — retained but hidden from the
// default admin views and skipped for notification emails — rather than
// hard-rejected, so a false positive never loses a genuine enquiry. The one
// exception is disposable-email dropping on the newsletter form (email-only, no
// is_spam column), which accept-and-drops silently.

const URL_G = /(?:https?:\/\/|www\.)[^\s]+/gi;
const URL_ONE = /(?:https?:\/\/|www\.)[^\s]+/i;
const MARKUP_LINK = /\[(?:url|link)[=\]]|<a\s|href\s*=/i;

// Known throwaway / disposable email domains (subset — extend as needed).
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.info", "grr.la", "sharklasers.com",
  "10minutemail.com", "10minutemail.net", "tempmail.com", "temp-mail.org", "tempmail.net",
  "yopmail.com", "trashmail.com", "trashmail.net", "getnada.com", "nada.email", "dispostable.com",
  "maildrop.cc", "fakeinbox.com", "spam4.me", "mytemp.email", "throwawaymail.com", "mailnesia.com",
  "emailondeck.com", "tempr.email", "moakt.com", "mohmal.com", "mailcatch.com", "inboxbear.com",
  "discard.email", "spambog.com", "tempinbox.com", "einrot.com", "cool.fr.nf", "jetable.org",
  "getairmail.com", "harakirimail.com", "maileater.com", "spamgourmet.com", "vomoto.com",
]);

const SPAM_KEYWORDS = [
  "viagra", "cialis", "casino", "porn", "crypto", "bitcoin", "forex", "payday loan",
  "backlink", "seo service", "rank your site", "cheap price", "free money", "weight loss",
  "escort", "betting", "gambling", "replica watch", "buy now", "click here", "make money online",
];

function countUrls(s) {
  if (!s) return 0;
  const m = String(s).match(URL_G);
  return m ? m.length : 0;
}

function emailDomain(email) {
  const s = String(email || "").toLowerCase();
  const at = s.lastIndexOf("@");
  return at >= 0 ? s.slice(at + 1) : "";
}

function isDisposableEmail(email) {
  return DISPOSABLE_DOMAINS.has(emailDomain(email));
}

/**
 * Score a submission's spamminess. Only the fields present are considered.
 * @param {{name?:string, email?:string, subject?:string, message?:string, organization?:string}} f
 * @returns {{ spam: boolean, score: number, reasons: string[] }}
 */
function scoreSubmission(f = {}) {
  let score = 0;
  const reasons = [];

  const longText = [f.subject, f.message].filter(Boolean).join(" ");
  const shortText = [f.name, f.organization].filter(Boolean).join(" ");

  const urls = countUrls(longText) + countUrls(shortText);
  if (urls >= 2) { score += 3; reasons.push(`${urls} links`); }
  else if (urls === 1) { score += 2; reasons.push("contains a link"); }

  if (MARKUP_LINK.test(longText) || MARKUP_LINK.test(shortText)) { score += 3; reasons.push("markup link"); }

  if (isDisposableEmail(f.email)) { score += 3; reasons.push("disposable email"); }

  const hay = `${longText} ${shortText}`.toLowerCase();
  const hit = SPAM_KEYWORDS.find((k) => hay.includes(k));
  if (hit) { score += 2; reasons.push(`keyword: ${hit}`); }

  // A name that is itself a URL is a classic spam signature.
  if (f.name && URL_ONE.test(f.name)) { score += 2; reasons.push("link in name"); }

  return { spam: score >= 3, score, reasons };
}

module.exports = { scoreSubmission, isDisposableEmail, emailDomain, DISPOSABLE_DOMAINS };
