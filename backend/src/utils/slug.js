// Slug generation + validation. Slugs map to live site URLs, so they're
// kebab-case and globally unique per table.

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Turn arbitrary text into a kebab-case slug. */
function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumerics -> hyphen
    .replace(/^-+|-+$/g, "")     // trim leading/trailing hyphens
    .slice(0, 120);
}

/** True if a string is a valid kebab-case slug (<= 120 chars). */
function isValidSlug(s) {
  return typeof s === "string" && s.length > 0 && s.length <= 120 && SLUG_RE.test(s);
}

module.exports = { slugify, isValidSlug, SLUG_RE };
