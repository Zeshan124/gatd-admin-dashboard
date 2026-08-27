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
