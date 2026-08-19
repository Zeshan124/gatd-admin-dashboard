/**
 * Centralized admin dashboard API client.
 *
 * ALL dashboard data access goes through this file, so wiring the real
 * backend (endpoint paths / response shapes) is a single-file change.
 *
 * Base URL is configurable via NEXT_PUBLIC_ADMIN_API; defaults to the local
 * dev backend. Paths below follow docs/program-registrations-backend.md — if
 * your backend differs, adjust the paths in `registrationsApi` only.
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_ADMIN_API || "http://localhost:5000/apis";

function authHeaders() {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem("gatd_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Build a querystring from a params object, skipping empty values. */
function toQuery(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, v);
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

async function request(path, { method = "GET", body, params, headers } = {}) {
  const url = `${API_BASE}${path}${toQuery(params)}`;
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...(headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    const err = new Error(
      "Unable to reach the API. Is the backend running at " + API_BASE + "?"
    );
    err.status = 0;
    throw err;
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Token expired/invalid on an authenticated call → clear session, bounce to login.
    if (
      res.status === 401 &&
      typeof window !== "undefined" &&
      !path.startsWith("/auth")
    ) {
      window.localStorage.removeItem("gatd_admin_token");
      window.localStorage.removeItem("gatd_admin_user");
      if (!window.location.pathname.startsWith("/admin/login")) {
        window.location.assign("/admin/login");
      }
    }
    const err = new Error(json?.error?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

// ── Registrations (form module) ─────────────────────────────────────────────
export const registrationsApi = {
  /** List with filters/search/sort/pagination → { data: [...], meta: {...} } */
  list: (params) => request("/registrations", { params }),
  /** Distinct solutions + programmes for filter dropdowns → { data: { solutions, programs } } */
  facets: () => request("/registrations/facets"),
  /** Single registration (full detail) → { data: {...} } */
  get: (id) => request(`/registrations/${id}`),
  /** Transition status → { data: {...} } */
  updateStatus: (id, status, note) =>
    request(`/registrations/${id}/status`, {
      method: "POST",
      body: { status, note },
    }),
  /** Partial update (assignment, notes) */
  update: (id, body) =>
    request(`/registrations/${id}`, { method: "PATCH", body }),
  /** Soft delete */
  remove: (id) =>
    request(`/registrations/${id}`, { method: "DELETE" }),
  /** Dashboard metrics → { totals, byStatus, byProgram, revenueCents, ... } */
  stats: () => request("/registrations/stats"),
  /**
   * Download the export honoring the same filters as the list.
   * Default → .xlsx; pass { format: "csv" } for CSV. The bearer token goes in
   * the Authorization header, so this is fetched as a blob (a plain link can't
   * send the header). Returns { blob, filename }.
   */
  exportFile: async (params = {}) => {
    const url = `${API_BASE}/registrations/export${toQuery(params)}`;
    let res;
    try {
      res = await fetch(url, { headers: { ...authHeaders() } });
    } catch (e) {
      const err = new Error(
        "Unable to reach the API. Is the backend running at " + API_BASE + "?"
      );
      err.status = 0;
      throw err;
    }

    if (!res.ok) {
      if (res.status === 401 && typeof window !== "undefined") {
        window.localStorage.removeItem("gatd_admin_token");
        window.localStorage.removeItem("gatd_admin_user");
        if (!window.location.pathname.startsWith("/admin/login")) {
          window.location.assign("/admin/login");
        }
      }
      let msg = `Export failed (${res.status})`;
      try {
        const j = await res.json();
        msg = j?.error?.message || msg;
      } catch {
        /* non-JSON error body */
      }
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }

    const blob = await res.blob();
    // Prefer the server-provided filename (Content-Disposition), else fall back.
    const cd = res.headers.get("Content-Disposition") || "";
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
    const filename = match
      ? decodeURIComponent(match[1])
      : `registrations.${params.format === "csv" ? "csv" : "xlsx"}`;
    return { blob, filename };
  },
};

// ── Contact messages ────────────────────────────────────────────────────────
export const contactApi = {
  /** List with search/status/pagination → { data: [...], meta: {...} } */
  list: (params) => request("/contact", { params }),
  /** Single message → { data: {...} } */
  get: (id) => request(`/contact/${id}`),
  /** Update status (new | read | replied | archived) → { data: {...} } */
  updateStatus: (id, status) =>
    request(`/contact/${id}`, { method: "PATCH", body: { status } }),
  /**
   * Download the export honoring the same filters as the list. Default → .xlsx;
   * pass { format: "csv" } for CSV. Fetched as a blob so the bearer token can go
   * in the Authorization header. Returns { blob, filename }.
   */
  exportFile: async (params = {}) => {
    const url = `${API_BASE}/contact/export${toQuery(params)}`;
    let res;
    try {
      res = await fetch(url, { headers: { ...authHeaders() } });
    } catch (e) {
      const err = new Error(
        "Unable to reach the API. Is the backend running at " + API_BASE + "?"
      );
      err.status = 0;
      throw err;
    }

    if (!res.ok) {
      if (res.status === 401 && typeof window !== "undefined") {
        window.localStorage.removeItem("gatd_admin_token");
        window.localStorage.removeItem("gatd_admin_user");
        if (!window.location.pathname.startsWith("/admin/login")) {
          window.location.assign("/admin/login");
        }
      }
      let msg = `Export failed (${res.status})`;
      try {
        const j = await res.json();
        msg = j?.error?.message || msg;
      } catch {
        /* non-JSON error body */
      }
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }

    const blob = await res.blob();
    const cd = res.headers.get("Content-Disposition") || "";
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
    const filename = match
      ? decodeURIComponent(match[1])
      : `messages.${params.format === "csv" ? "csv" : "xlsx"}`;
    return { blob, filename };
  },
};

// ── Brochure leads ───────────────────────────────────────────────────────────
export const brochuresApi = {
  /** List with filters (sourceType, status, q, page, pageSize) → { data, meta } */
  list: (params) => request("/brochure-leads", { params }),
  /** Single lead → { data: {...} } */
  get: (id) => request(`/brochure-leads/${id}`),
  /** Update status (new | contacted | archived) → { data: {...} } */
  updateStatus: (id, status) =>
    request(`/brochure-leads/${id}`, { method: "PATCH", body: { status } }),
  /** Download export (xlsx default, { format: "csv" }) → { blob, filename } */
  exportFile: async (params = {}) => {
    const url = `${API_BASE}/brochure-leads/export${toQuery(params)}`;
    let res;
    try {
      res = await fetch(url, { headers: { ...authHeaders() } });
    } catch (e) {
      const err = new Error(
        "Unable to reach the API. Is the backend running at " + API_BASE + "?"
      );
      err.status = 0;
      throw err;
    }
    if (!res.ok) {
      if (res.status === 401 && typeof window !== "undefined") {
        window.localStorage.removeItem("gatd_admin_token");
        window.localStorage.removeItem("gatd_admin_user");
        if (!window.location.pathname.startsWith("/admin/login")) {
          window.location.assign("/admin/login");
        }
      }
      let msg = `Export failed (${res.status})`;
      try {
        const j = await res.json();
        msg = j?.error?.message || msg;
      } catch {
        /* non-JSON */
      }
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    const blob = await res.blob();
    const cd = res.headers.get("Content-Disposition") || "";
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
    const filename = match
      ? decodeURIComponent(match[1])
      : `brochure-leads.${params.format === "csv" ? "csv" : "xlsx"}`;
    return { blob, filename };
  },
};

// ── Dashboard stats ──────────────────────────────────────────────────────────
export const statsApi = {
  /** Aggregated overview metrics + 14-day trend → { data: {...} } */
  overview: () => request("/stats/overview"),
};

// ── Auth ────────────────────────────────────────────────────────────────────
// Signup is gated by a key the backend checks (x-signup-key). It's exposed to
// the client via NEXT_PUBLIC_SIGNUP_KEY — anything NEXT_PUBLIC_* ends up in the
// bundle, so keep signup disabled in production (or move account creation
// server-side) once the initial admin accounts exist.
export const SIGNUP_KEY =
  process.env.NEXT_PUBLIC_SIGNUP_KEY || "change-this-signup-key";

export const authApi = {
  /** → { data: { user, token } } */
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),
  /** → { data: { user, token } } (token may be omitted → caller redirects to login) */
  signup: ({ name, email, password }, signupKey) =>
    request("/auth/signup", {
      method: "POST",
      body: { name, email, password },
      headers: { "x-signup-key": signupKey || SIGNUP_KEY },
    }),
};
