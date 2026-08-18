// Server-side validation + normalization for the public registration form.
// Mirrors §6 of the spec. Returns { valid, errors, value } — never throws on
// bad input; `errors` is a field -> message map suitable for a 422 response.

const { isSupportedCountry } = require("./countries");

// --- normalization helpers -------------------------------------------------

// Replace C0 control chars (code < 32) and DEL (127) with a space, so they
// can't smuggle newlines/nulls into stored values; whitespace is collapsed next.
function stripControlChars(s) {
  let out = "";
  for (const ch of s) {
    const code = ch.codePointAt(0);
    out += code < 32 || code === 127 ? " " : ch;
  }
  return out;
}

const collapseWhitespace = (s) => s.replace(/\s+/g, " ").trim();

/** Coerce to a clean single-line string (or "" if not a string). */
function cleanStr(v) {
  if (typeof v !== "string") return "";
  return collapseWhitespace(stripControlChars(v));
}

// --- field patterns --------------------------------------------------------

const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u; // letters/marks + space . ' -
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s()+-]{4,20}$/; // raw input: digits, spaces, ( ) + -

/**
 * Validate and normalize a raw registration request body.
 * Note: programme existence/pricing is validated later against the DB.
 * @param {object} body
 * @returns {{ valid: boolean, errors: Record<string,string>, value: object }}
 */
function validateRegistration(body = {}) {
  const errors = {};
  const value = {};

  // firstName — required
  const firstName = cleanStr(body.firstName);
  if (!firstName) {
    errors.firstName = "First name is required";
  } else if (firstName.length < 2 || firstName.length > 120) {
    errors.firstName = "First name must be between 2 and 120 characters";
  } else if (!NAME_RE.test(firstName)) {
    errors.firstName = "First name contains invalid characters";
  }
  value.firstName = firstName;

  // lastName — optional (future)
  const lastName = cleanStr(body.lastName);
  if (lastName) {
    if (lastName.length > 120) {
      errors.lastName = "Last name must be at most 120 characters";
    } else if (!NAME_RE.test(lastName)) {
      errors.lastName = "Last name contains invalid characters";
    }
  }
  value.lastName = lastName || null;

  // email — required
  const email = cleanStr(body.email).toLowerCase().replace(/\s+/g, "");
  if (!email) {
    errors.email = "Email address is required";
  } else if (email.length > 255 || !EMAIL_RE.test(email)) {
    errors.email = "Must be a valid email address";
  }
  value.email = email;

  // phoneCountry — required, supported ISO-2
  const phoneCountry = cleanStr(body.phoneCountry).toUpperCase();
  if (!phoneCountry) {
    errors.phoneCountry = "Phone country is required";
  } else if (!isSupportedCountry(phoneCountry)) {
    errors.phoneCountry = "Unsupported country code";
  }
  value.phoneCountry = phoneCountry;

  // phoneNumber — required; store digits only
  const phoneRaw = cleanStr(body.phoneNumber);
  if (!phoneRaw) {
    errors.phoneNumber = "Phone number is required";
  } else if (!PHONE_RE.test(phoneRaw)) {
    errors.phoneNumber = "Phone number is invalid";
  } else {
    const digits = phoneRaw.replace(/\D/g, "");
    if (digits.length < 4 || digits.length > 20) {
      errors.phoneNumber = "Phone number is invalid";
    }
    value.phoneNumber = digits;
  }

  // country — optional (recommended)
  const country = cleanStr(body.country);
  if (country && country.length > 120) errors.country = "Country must be at most 120 characters";
  value.country = country || null;

  // designation — optional
  const designation = cleanStr(body.designation);
  if (designation && designation.length > 160) errors.designation = "Designation must be at most 160 characters";
  value.designation = designation || null;

  // organization — optional (recommended)
  const organization = cleanStr(body.organization);
  if (organization && organization.length > 200) errors.organization = "Organization must be at most 200 characters";
  value.organization = organization || null;

  // hearAboutUs — optional
  const hearAboutUs = cleanStr(body.hearAboutUs);
  if (hearAboutUs && hearAboutUs.length > 200) errors.hearAboutUs = "This field must be at most 200 characters";
  value.hearAboutUs = hearAboutUs || null;

  // programSlugs — required, non-empty array of known-shaped slugs (existence checked vs DB later)
  let slugs = body.programSlugs;
  if (!Array.isArray(slugs) || slugs.length === 0) {
    errors.programSlugs = "Select at least one programme";
    value.programSlugs = [];
  } else {
    const cleaned = [];
    let bad = false;
    for (const s of slugs) {
      const slug = cleanStr(s).toLowerCase();
      if (!slug || slug.length > 120 || !/^[a-z0-9-]+$/.test(slug)) {
        bad = true;
        continue;
      }
      if (!cleaned.includes(slug)) cleaned.push(slug); // de-duplicate
    }
    if (cleaned.length === 0) {
      errors.programSlugs = "Select at least one valid programme";
    } else if (bad) {
      errors.programSlugs = "One or more selected programmes are invalid";
    }
    value.programSlugs = cleaned;
  }

  // sourcePage — optional; relative path or same-site URL, <= 255
  const sourcePage = cleanStr(body.sourcePage);
  if (sourcePage) {
    if (sourcePage.length > 255 || /\s/.test(sourcePage)) {
      errors.sourcePage = "Invalid source page";
    }
  }
  value.sourcePage = sourcePage || null;

  // utm — optional; each field <= 120
  const utm = body.utm && typeof body.utm === "object" ? body.utm : {};
  value.utm = {
    source: cleanStr(utm.source).slice(0, 120) || null,
    medium: cleanStr(utm.medium).slice(0, 120) || null,
    campaign: cleanStr(utm.campaign).slice(0, 120) || null,
  };

  return { valid: Object.keys(errors).length === 0, errors, value };
}

module.exports = { validateRegistration };
