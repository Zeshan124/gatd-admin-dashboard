const { query } = require("../config/db");
const { hashPassword, verifyPassword } = require("../utils/password");
const { signToken } = require("../utils/jwt");
const { sendError } = require("../utils/http");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

/**
 * POST /apis/auth/signup
 * Create a dashboard account. Guarded by a shared secret: the caller must send
 * header `x-signup-key` matching ADMIN_SIGNUP_KEY. Returns the user + a token.
 */
async function signup(req, res) {
  try {
    const configuredKey = process.env.ADMIN_SIGNUP_KEY || "";
    if (!configuredKey) {
      return sendError(res, 403, "SIGNUP_DISABLED", "Signup is disabled (ADMIN_SIGNUP_KEY is not set)");
    }
    if ((req.headers["x-signup-key"] || "") !== configuredKey) {
      return sendError(res, 403, "FORBIDDEN", "Invalid signup key");
    }

    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    const fields = {};
    if (!name || name.length > 160) fields.name = "Name is required (max 160 chars)";
    if (!email || email.length > 255 || !EMAIL_RE.test(email)) fields.email = "Must be a valid email address";
    if (!password || password.length < 8) fields.password = "Password must be at least 8 characters";
    if (Object.keys(fields).length) {
      return sendError(res, 422, "VALIDATION_ERROR", "One or more fields are invalid", fields);
    }

    const role = req.body.role === "super_admin" || req.body.role === "viewer" ? req.body.role : "admin";
    const passwordHash = await hashPassword(password);

    let result;
    try {
      result = await query(
        `INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        [name, email, passwordHash, role]
      );
    } catch (err) {
      if (err && err.code === "ER_DUP_ENTRY") {
        return sendError(res, 409, "EMAIL_TAKEN", "An account with this email already exists");
      }
      throw err;
    }

    const user = { id: result.insertId, name, email, role };
    const token = signToken(user);
    return res.status(201).json({ data: { user: publicUser(user), token } });
  } catch (err) {
    console.error("[auth] signup error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not create account");
  }
}

/**
 * POST /apis/auth/login
 * Email + password -> JWT access token.
 */
async function login(req, res) {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return sendError(res, 422, "VALIDATION_ERROR", "Email and password are required");
    }

    const rows = await query(
      `SELECT id, name, email, password_hash, role, is_active FROM admin_users WHERE email = ? LIMIT 1`,
      [email]
    );
    const user = rows[0];

    // Generic message either way to avoid leaking which emails exist.
    if (!user || !user.is_active || !(await verifyPassword(password, user.password_hash))) {
      return sendError(res, 401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

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
 * Return the currently authenticated admin (requires a valid token).
 */
async function me(req, res) {
  try {
    const rows = await query(
      `SELECT id, name, email, role FROM admin_users WHERE id = ? AND is_active = 1 LIMIT 1`,
      [req.admin.id]
    );
    if (!rows[0]) return sendError(res, 401, "UNAUTHENTICATED", "Account not found or inactive");
    return res.json({ data: publicUser(rows[0]) });
  } catch (err) {
    console.error("[auth] me error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load profile");
  }
}

module.exports = { signup, login, me };
