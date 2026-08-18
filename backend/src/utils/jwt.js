const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "12h";

if (!SECRET) {
  console.warn("[auth] JWT_SECRET is not set — set it in .env before using the dashboard auth.");
}

/**
 * Sign an access token for an admin user.
 * @param {{ id: number, email: string, role: string }} user
 * @returns {string}
 */
function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    SECRET,
    { expiresIn: EXPIRES_IN }
  );
}

/**
 * Verify a token and return its decoded payload, or throw if invalid/expired.
 * @param {string} token
 */
function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };
