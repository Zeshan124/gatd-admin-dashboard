const { query } = require("../config/db");
const { hashPassword } = require("../utils/password");
const { sendError } = require("../utils/http");
const {
  MODULES,
  LEVELS,
  ROLES,
  ROLE_PRESETS,
  normalizePermissions,
  effectivePermissions,
} = require("../utils/permissions");

// Dashboard account management (Super Admin only — enforced in the routes).
//
// Safety rules:
//   - you can't change your own role, deactivate yourself, or delete yourself;
//   - the last active Super Admin can't be demoted, deactivated or deleted.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: !!u.is_active,
    // false = created before access control: full access until saved here.
    accessConfigured: u.role === "super_admin" || u.permissions != null,
    permissions: effectivePermissions(u),
    twoFactorEnabled: !!u.totp_enabled,
    lastLoginAt: u.last_login_at,
    createdAt: u.created_at,
  };
}

// SELECT * so this keeps working whichever migrations have run (mapUser only
// exposes safe fields — never the password hash or authenticator key).
async function getUser(id) {
  const rows = await query(`SELECT * FROM admin_users WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

/** Number of active Super Admins other than `excludeId`. */
async function otherActiveSuperAdmins(excludeId) {
  const rows = await query(
    `SELECT COUNT(*) AS n FROM admin_users WHERE role = 'super_admin' AND is_active = 1 AND id <> ?`,
    [excludeId]
  );
  return Number(rows[0].n) || 0;
}

/** Validate shared fields. Returns { cols, fields } (cols = DB column values). */
async function collect(body, { creating }) {
  const cols = {};
  const fields = {};

  if (creating || body.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 160) fields.name = "Name is required (max 160 characters)";
    else cols.name = name;
  }
  if (creating || body.email !== undefined) {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || email.length > 255 || !EMAIL_RE.test(email)) fields.email = "Enter a valid email address";
    else cols.email = email;
  }
  if (creating || (body.password !== undefined && body.password !== "")) {
    const password = typeof body.password === "string" ? body.password : "";
    if (password.length < 8) fields.password = "Password must be at least 8 characters";
    else cols.password_hash = await hashPassword(password);
  }
  if (creating || body.role !== undefined) {
    if (!ROLES.includes(body.role)) fields.role = `Role must be one of: ${ROLES.join(", ")}`;
    else cols.role = body.role;
  }
  if (body.isActive !== undefined) cols.is_active = body.isActive ? 1 : 0;

  return { cols, fields };
}

/**
 * Decide the permissions column value for the account's (new) role.
 * Super Admins always have full access, so nothing is stored for them.
 */
function permissionsFor(role, bodyPermissions) {
  if (role === "super_admin") return null;
  const perms = bodyPermissions !== undefined ? normalizePermissions(bodyPermissions) : ROLE_PRESETS[role] || {};
  return JSON.stringify(perms);
}

// GET /apis/admin/users/meta — sections, levels, roles and role presets for the form
function meta(req, res) {
  return res.json({ data: { modules: MODULES, levels: LEVELS, roles: ROLES, presets: ROLE_PRESETS } });
}

// GET /apis/admin/users
async function list(req, res) {
  try {
    const rows = await query(
      `SELECT * FROM admin_users
        ORDER BY FIELD(role, 'super_admin', 'admin', 'editor', 'viewer'), name ASC`
    );
    return res.json({ data: rows.map(mapUser) });
  } catch (err) {
    console.error("[users] list error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load accounts");
  }
}

// POST /apis/admin/users   { name, email, password, role, permissions?, isActive? }
async function create(req, res) {
  try {
    const { cols, fields } = await collect(req.body, { creating: true });
    if (Object.keys(fields).length) return sendError(res, 422, "VALIDATION_ERROR", "One or more fields are invalid", fields);

    cols.permissions = permissionsFor(cols.role, req.body.permissions);
    if (cols.is_active === undefined) cols.is_active = 1;

    const names = Object.keys(cols);
    let result;
    try {
      result = await query(
        `INSERT INTO admin_users (${names.join(", ")}) VALUES (${names.map(() => "?").join(", ")})`,
        Object.values(cols)
      );
    } catch (err) {
      if (err && err.code === "ER_DUP_ENTRY") {
        return sendError(res, 409, "EMAIL_TAKEN", "An account with this email already exists", {
          email: "An account with this email already exists",
        });
      }
      throw err;
    }
    return res.status(201).json({ data: mapUser(await getUser(result.insertId)) });
  } catch (err) {
    console.error("[users] create error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not create the account");
  }
}

// PATCH /apis/admin/users/:id   any of { name, email, password, role, permissions, isActive }
async function update(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = Number.isNaN(id) ? null : await getUser(id);
    if (!existing) return sendError(res, 404, "NOT_FOUND", "Account not found");

    const { cols, fields } = await collect(req.body, { creating: false });
    if (Object.keys(fields).length) return sendError(res, 422, "VALIDATION_ERROR", "One or more fields are invalid", fields);

    const isSelf = existing.id === req.admin.id;
    const newRole = cols.role !== undefined ? cols.role : existing.role;
    const deactivating = cols.is_active === 0 && existing.is_active;

    if (isSelf && cols.role !== undefined && cols.role !== existing.role) {
      return sendError(res, 422, "VALIDATION_ERROR", "You can't change your own role.", { role: "You can't change your own role." });
    }
    if (isSelf && deactivating) {
      return sendError(res, 422, "VALIDATION_ERROR", "You can't deactivate your own account.", { isActive: "You can't deactivate your own account." });
    }
    const losesSuperAdmin = existing.role === "super_admin" && existing.is_active && (newRole !== "super_admin" || deactivating);
    if (losesSuperAdmin && (await otherActiveSuperAdmins(existing.id)) === 0) {
      return sendError(res, 422, "LAST_SUPER_ADMIN", "There must always be at least one active Super Admin.");
    }

    // Permissions: recompute when the role changes or permissions are sent.
    if (cols.role !== undefined || req.body.permissions !== undefined) {
      cols.permissions = permissionsFor(newRole, req.body.permissions);
    }

    if (!Object.keys(cols).length) return sendError(res, 422, "VALIDATION_ERROR", "No changes provided");

    try {
      await query(
        `UPDATE admin_users SET ${Object.keys(cols).map((c) => `${c} = ?`).join(", ")} WHERE id = ?`,
        [...Object.values(cols), existing.id]
      );
    } catch (err) {
      if (err && err.code === "ER_DUP_ENTRY") {
        return sendError(res, 409, "EMAIL_TAKEN", "An account with this email already exists", {
          email: "An account with this email already exists",
        });
      }
      throw err;
    }
    return res.json({ data: mapUser(await getUser(existing.id)) });
  } catch (err) {
    console.error("[users] update error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not update the account");
  }
}

// DELETE /apis/admin/users/:id
async function remove(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = Number.isNaN(id) ? null : await getUser(id);
    if (!existing) return sendError(res, 404, "NOT_FOUND", "Account not found");

    if (existing.id === req.admin.id) {
      return sendError(res, 422, "VALIDATION_ERROR", "You can't delete your own account.");
    }
    if (existing.role === "super_admin" && existing.is_active && (await otherActiveSuperAdmins(existing.id)) === 0) {
      return sendError(res, 422, "LAST_SUPER_ADMIN", "There must always be at least one active Super Admin.");
    }

    await query(`DELETE FROM admin_users WHERE id = ?`, [existing.id]);
    return res.json({ data: { id: existing.id, deleted: true } });
  } catch (err) {
    console.error("[users] delete error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not delete the account");
  }
}

// POST /apis/admin/users/:id/reset-2fa
// For a lost/replaced phone: clears their authenticator key and backup codes.
// They'll be asked to scan a new QR code the next time they sign in.
async function resetTwoFactor(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = Number.isNaN(id) ? null : await getUser(id);
    if (!existing) return sendError(res, 404, "NOT_FOUND", "Account not found");

    await query(
      `UPDATE admin_users
          SET totp_enabled = 0, totp_secret = NULL, totp_last_step = NULL,
              totp_backup_codes = NULL, totp_enabled_at = NULL
        WHERE id = ?`,
      [existing.id]
    );
    return res.json({ data: mapUser(await getUser(existing.id)) });
  } catch (err) {
    console.error("[users] reset 2FA error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not reset two-factor authentication");
  }
}

module.exports = { meta, list, create, update, remove, resetTwoFactor };
