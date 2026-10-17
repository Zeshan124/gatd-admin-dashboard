const { query } = require("../config/db");
const { hashPassword, verifyPassword } = require("../utils/password");
const { signToken, signChallenge } = require("../utils/jwt");
const { sendError } = require("../utils/http");
const { effectivePermissions } = require("../utils/permissions");

/** Account shape sent to the dashboard (never includes the password hash). */
function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    permissions: effectivePermissions(u),
  };
}

/**
 * POST /apis/auth/signup — DISABLED.
 * Dashboard accounts are now created by a Super Admin in Admin → Users, so
 * nobody can register themselves (or pick their own role).
 */
async function signup(req, res) {
  return sendError(
    res,
    403,
    "SIGNUP_DISABLED",
    "Self sign-up is disabled. Please ask a Super Admin to create your account."
  );
}

/**
 * Find an account by email. Tolerates migrations not having run yet (backend
 * deployed first): without the 2FA columns, `twoFactorReady` is false; without
 * the permissions column too, the account is treated as legacy full access.
 */
async function findByEmail(email) {
  const base = "id, name, email, password_hash, role, is_active";
  const attempts = [
    [`${base}, permissions, totp_enabled`, (r) => ({ ...r, twoFactorReady: true })],
    [`${base}, permissions`, (r) => ({ ...r, twoFactorReady: false })],
    [base, (r) => ({ ...r, permissions: null, twoFactorReady: false })],
  ];
  for (const [cols, shape] of attempts) {
    try {
      const rows = await query(`SELECT ${cols} FROM admin_users WHERE email = ? LIMIT 1`, [email]);
      return rows[0] ? shape(rows[0]) : null;
    } catch (err) {
      if (!err || err.code !== "ER_BAD_FIELD_ERROR") throw err;
    }
  }
  return null;
}

/**
 * POST /apis/auth/login   { email, password }
 * Step 1 of 2. A correct password does NOT log in: it returns a short-lived
 * challenge for the authenticator step —
 *   { twoFactor: "verify", challengeToken }  → enter the 6-digit code
 *   { twoFactor: "setup",  challengeToken }  → first time: scan the QR code
 * (2FA is required for every account.)
 */
async function login(req, res) {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return sendError(res, 422, "VALIDATION_ERROR", "Email and password are required");
    }

    const user = await findByEmail(email);

    // Generic message either way to avoid leaking which emails exist.
    if (!user || !user.is_active || !(await verifyPassword(password, user.password_hash))) {
      return sendError(res, 401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    if (user.twoFactorReady) {
      return res.json({
        data: {
          twoFactor: user.totp_enabled ? "verify" : "setup",
          challengeToken: signChallenge(user),
          email: user.email,
        },
      });
    }

    // 2FA migration not applied yet — fall back to password-only so nobody is locked out.
    console.warn("[auth] 2FA columns missing — signing in with password only. Run migration_admin_two_factor.sql.");
    await query(`UPDATE admin_users SET last_login_at = UTC_TIMESTAMP() WHERE id = ?`, [user.id]);
    const token = signToken(user);
    return res.json({ data: { user: publicUser(user), token } });
  } catch (err) {
    console.error("[auth] login error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not log in");
  }
}

/**
 * GET /apis/auth/me
 * The signed-in account with its current role and access (requireAdmin has
 * already re-read it from the database).
 */
async function me(req, res) {
  const a = req.admin;
  return res.json({
    data: { id: a.id, name: a.name, email: a.email, role: a.role, permissions: a.permissions },
  });
}

/**
 * PATCH /apis/auth/password   { currentPassword, newPassword }
 * Any signed-in user can change their own password.
 */
async function changePassword(req, res) {
  try {
    const currentPassword = typeof req.body.currentPassword === "string" ? req.body.currentPassword : "";
    const newPassword = typeof req.body.newPassword === "string" ? req.body.newPassword : "";

    const fields = {};
    if (!currentPassword) fields.currentPassword = "Enter your current password";
    if (newPassword.length < 8) fields.newPassword = "New password must be at least 8 characters";
    else if (newPassword === currentPassword) fields.newPassword = "New password must be different from the current one";
    if (Object.keys(fields).length) {
      return sendError(res, 422, "VALIDATION_ERROR", "One or more fields are invalid", fields);
    }

    const rows = await query(`SELECT password_hash FROM admin_users WHERE id = ? LIMIT 1`, [req.admin.id]);
    if (!rows[0] || !(await verifyPassword(currentPassword, rows[0].password_hash))) {
      return sendError(res, 422, "VALIDATION_ERROR", "Current password is incorrect", {
        currentPassword: "Current password is incorrect",
      });
    }

    await query(`UPDATE admin_users SET password_hash = ? WHERE id = ?`, [await hashPassword(newPassword), req.admin.id]);
    return res.json({ data: { updated: true } });
  } catch (err) {
    console.error("[auth] change password error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not change password");
  }
}

module.exports = { signup, login, me, changePassword, publicUser };
