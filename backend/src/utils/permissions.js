// Dashboard access control: sections ("modules"), access levels, role presets.
//
// Each admin account has a role (a label + preset) and its own per-section
// access levels, stored as JSON in admin_users.permissions, e.g.
//   { "registrations": "view", "blog": "manage" }
// Missing sections mean "none".
//
// Rules:
//   - super_admin  → manage everything, plus manage dashboard accounts. Not editable.
//   - permissions NULL → legacy account from before access control existed:
//                        full access until a Super Admin saves its permissions.
//   - otherwise    → exactly what is stored.
//
// Keep MODULES in sync with frontend/lib/permissions.js.

const LEVELS = ["none", "view", "manage"];
const RANK = { none: 0, view: 1, manage: 2 };

const MODULES = [
  { key: "overview", label: "Overview (dashboard statistics)" },
  { key: "registrations", label: "Registrations" },
  { key: "solutions", label: "Solutions, Programs & Subprograms" },
  { key: "messages", label: "Messages (Contact form)" },
  { key: "brochures", label: "Brochure Leads" },
  { key: "blog", label: "Blog" },
  { key: "newsletter", label: "Newsletter" },
  { key: "company_profile", label: "Company Profile" },
  { key: "site_popup", label: "Website Popup" },
  { key: "accreditation", label: "Accredited By" },
  { key: "sitemap", label: "Sitemap" },
];
const MODULE_KEYS = MODULES.map((m) => m.key);

// Sections whose editors upload images/PDFs (the shared upload endpoint).
const CONTENT_MODULES = ["solutions", "blog", "company_profile", "site_popup", "accreditation"];

const ROLES = ["super_admin", "admin", "editor", "viewer"];

const all = (level) => Object.fromEntries(MODULE_KEYS.map((k) => [k, level]));

// Starting point when a role is picked; the Super Admin can adjust per person.
const ROLE_PRESETS = {
  admin: all("manage"),
  editor: {
    ...all("none"),
    solutions: "manage",
    blog: "manage",
    company_profile: "manage",
    site_popup: "manage",
    accreditation: "manage",
    sitemap: "view",
  },
  viewer: all("view"),
};

/** Keep only known sections and levels; unknown keys/values are dropped. */
function normalizePermissions(input) {
  const out = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) return out;
  for (const key of MODULE_KEYS) {
    const level = input[key];
    if (level === "view" || level === "manage") out[key] = level;
  }
  return out;
}

/** Effective access for an account row ({ role, permissions }). */
function effectivePermissions(user) {
  if (!user) return all("none");
  if (user.role === "super_admin") return all("manage");
  let stored = user.permissions;
  if (typeof stored === "string") {
    try {
      stored = JSON.parse(stored);
    } catch {
      stored = null;
    }
  }
  if (stored == null) return all("manage"); // legacy account, not yet configured
  return { ...all("none"), ...normalizePermissions(stored) };
}

/** Does this access map allow `level` ("view" | "manage") on `moduleKey`? */
function can(perms, moduleKey, level = "view") {
  return (RANK[perms?.[moduleKey]] || 0) >= RANK[level];
}

module.exports = {
  LEVELS,
  MODULES,
  MODULE_KEYS,
  CONTENT_MODULES,
  ROLES,
  ROLE_PRESETS,
  normalizePermissions,
  effectivePermissions,
  can,
};
