const { verifyToken } = require("../utils/jwt");
const { sendError } = require("../utils/http");

/**
 * Require a valid admin JWT (sent as `Authorization: Bearer <token>`).
 * On success attaches req.admin = { id, email, role }.
 */
function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;

  if (!token) {
    return sendError(res, 401, "UNAUTHENTICATED", "Missing authentication token");
  }

  try {
    const payload = verifyToken(token);
    req.admin = { id: payload.sub, email: payload.email, role: payload.role };
    return next();
  } catch (err) {
    const expired = err && err.name === "TokenExpiredError";
    return sendError(res, 401, expired ? "TOKEN_EXPIRED" : "INVALID_TOKEN", expired ? "Session expired, please log in again" : "Invalid authentication token");
  }
}

module.exports = { requireAdmin };
