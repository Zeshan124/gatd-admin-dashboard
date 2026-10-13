const { query } = require("../config/db");
const { verifyToken } = require("../utils/jwt");
const { sendError } = require("../utils/http");
const { effectivePermissions, can } = require("../utils/permissions");

/**
 * Load an account by id. If the `permissions` column doesn't exist yet (backend
 * deployed before the migration), fall back to the old columns — the account is
 * then treated as a legacy full-access account instead of every request failing.
 */
async function loadAccount(id) {
  try {
    const rows = await query(
      `SELECT id, name, email, role, permissions, is_active FROM admin_users WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  } catch (err) {
    if (err && err.code !== "ER_BAD_FIELD_ERROR") throw err;
    const rows = await query(
      `SELECT id, name, email, role, is_active FROM admin_users WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] ? { ...rows[0], permissions: null } : null;
  }
}

/**
 * Require a valid admin JWT (sent as `Authorization: Bearer <token>`).
 *
 * The account is re-read from the database on every request, so deactivating
 * someone or changing their role/permissions takes effect immediately — not
 * only when their token expires.
 *
 * On success attaches req.admin = { id, name, email, role, permissions }.
 */
async function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;

  if (!token) {
    return sendError(res, 401, "UNAUTHENTICATED", "Missing authentication token");
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    const expired = err && err.name === "TokenExpiredError";
    return sendError(res, 401, expired ? "TOKEN_EXPIRED" : "INVALID_TOKEN", expired ? "Session expired, please log in again" : "Invalid authentication token");
  }

  try {
    const user = await loadAccount(payload.sub);
    if (!user || !user.is_active) {
      return sendError(res, 401, "UNAUTHENTICATED", "Account not found or deactivated");
    }
    req.admin = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: effectivePermissions(user),
    };
    return next();
  } catch (err) {
    console.error("[auth] account lookup error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not verify your account");
  }
}

const forbidden = (res, message) => sendError(res, 403, "FORBIDDEN", message);

/**
 * Authenticate, then require access to one dashboard section.
 * Level defaults from the HTTP method: GET/HEAD need "view", anything that
 * changes data (POST/PATCH/PUT/DELETE) needs "manage".
 * Returns a middleware array, usable wherever `requireAdmin` was.
 */
function requirePermission(moduleKey, level) {
  return [
    requireAdmin,
    (req, res, next) => {
      const needed = level || (req.method === "GET" || req.method === "HEAD" ? "view" : "manage");
      if (can(req.admin.permissions, moduleKey, needed)) return next();
      return forbidden(
        res,
        needed === "manage"
          ? "You have view-only access to this section and can't make changes."
          : "You don't have access to this section."
      );
    },
  ];
}

/** Authenticate, then require `level` on at least one of the given sections. */
function requireAnyPermission(moduleKeys, level = "manage") {
  return [
    requireAdmin,
    (req, res, next) => {
      if (moduleKeys.some((k) => can(req.admin.permissions, k, level))) return next();
      return forbidden(res, "You don't have permission to do this.");
    },
  ];
}

/** Authenticate, then require the Super Admin role (account management). */
const requireSuperAdmin = [
  requireAdmin,
  (req, res, next) => {
    if (req.admin.role === "super_admin") return next();
    return forbidden(res, "Only a Super Admin can manage dashboard accounts.");
  },
];

module.exports = { requireAdmin, requirePermission, requireAnyPermission, requireSuperAdmin, loadAccount };
