/**
 * Public (unauthenticated) content API for the marketing site.
 * Points at the same backend as the admin API; these endpoints are open.
 */
export const PUBLIC_API_BASE =
  process.env.NEXT_PUBLIC_ADMIN_API || "http://localhost:5000/apis";

function toQuery(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

async function pub(path, params) {
  let res;
  try {
    res = await fetch(`${PUBLIC_API_BASE}${path}${toQuery(params)}`);
  } catch (e) {
    const err = new Error("Unable to reach the content API.");
    err.status = 0;
    throw err;
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json?.error?.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return json;
}

export const publicBlogsApi = {
  /** { data: [cards], meta } */
  list: (params) => pub("/public/blogs", params),
  /** { data: post } */
  get: (slug) => pub(`/public/blogs/${encodeURIComponent(slug)}`),
  /** { data: [slug, ...] } */
  slugs: () => pub("/public/blogs/slugs"),
};

// Solutions CMS (public read). Level map: Solution = parent, Program = child
// solution, Subprogram = program. See docs/solutions-and-programs-backend.md.
export const publicSolutionsApi = {
  /** Header dropdown tree → { data: [{ slug, title, href, items:[{ slug,title,href, children:[{slug,title,href}] }] }] } */
  menu: () => pub("/public/solutions/menu"),
  /** Landing catalog → { data: [{ slug, title, description, children:[...] }] } */
  catalog: () => pub("/public/solutions"),
  /** One Solution (parent) page → { data: { slug, title, description, eyebrow, banner,
   *  middleImage, middleBadge, middleHeading, middleBody, children:[...] } } */
  parent: (slug) => pub(`/public/solutions/${encodeURIComponent(slug)}`),
  /** One Program (child solution) + its Subprograms → { data: {...} }. Pass a
   *  preview token to load a Draft/Hidden item by direct link. */
  child: (slug, preview) => pub(`/public/child-solutions/${encodeURIComponent(slug)}`, preview ? { preview } : undefined),
  /** One Subprogram (program) full detail → { data: {...} }. Pass a preview token
   *  to load a Draft/Hidden item by direct link. */
  program: (slug, preview) => pub(`/public/programs/${encodeURIComponent(slug)}`, preview ? { preview } : undefined),
  /** All published Subprogram slugs → { data: [{ slug, title, childSolutionSlug }] } */
  programSlugs: () => pub("/public/programs"),
};

// Company Profile settings for the header popup (public read).
export const publicCompanyProfileApi = {
  /** { data: { isEnabled, eyebrow, heading, description, buttonLabel, pdfUrl } } */
  get: () => pub("/public/company-profile"),
};

// "Accredited By" settings shown on Program pages (public read).
export const publicAccreditationApi = {
  /** { data: { heading, logos:[{ name, logo }] } } */
  get: () => pub("/public/accreditation"),
};
