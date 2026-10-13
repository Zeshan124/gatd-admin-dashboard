// Dashboard access control — frontend side. The backend enforces every rule;
// this file only decides what to show (menu items, pages, buttons).
// Keep MODULES in sync with backend/src/utils/permissions.js.

export const LEVEL_RANK = { none: 0, view: 1, manage: 2 };

export const MODULES = [
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

export const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export const ROLE_DESCRIPTIONS = {
  super_admin: "Full access to everything, including creating accounts and assigning access.",
  admin: "Manages all dashboard sections. Can't manage accounts.",
  editor: "Manages website content (Solutions, Blog, Popup, Company Profile, Accredited By).",
  viewer: "Can view every section but can't change anything.",
};

// Dashboard page (path prefix) → section. Longest prefix wins; "/admin" is exact.
const PAGE_MODULES = [
  ["/admin/registrations", "registrations"],
  ["/admin/solutions", "solutions"],
  ["/admin/programs", "solutions"],
  ["/admin/subprograms", "solutions"],
  ["/admin/messages", "messages"],
  ["/admin/brochures", "brochures"],
  ["/admin/blog", "blog"],
  ["/admin/newsletter", "newsletter"],
  ["/admin/company-profile", "company_profile"],
  ["/admin/site-popup", "site_popup"],
  ["/admin/accreditation", "accreditation"],
  ["/admin/sitemap", "sitemap"],
];

/** Section for a dashboard path; "users" for account management; null = open to all signed-in users. */
export function moduleForPath(pathname) {
  if (!pathname) return null;
  if (pathname === "/admin") return "overview";
  if (pathname.startsWith("/admin/users")) return "users";
  const hit = PAGE_MODULES.find(([prefix]) => pathname === prefix || pathname.startsWith(prefix + "/"));
  return hit ? hit[1] : null;
}

/** Can this user do `level` ("view" | "manage") in `moduleKey`? */
export function canAccess(user, moduleKey, level = "view") {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  if (moduleKey === "users") return false;
  // Accounts saved before access control existed have no map → full access (matches backend).
  if (!user.permissions) return true;
  return (LEVEL_RANK[user.permissions[moduleKey]] || 0) >= LEVEL_RANK[level];
}
