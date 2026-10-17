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

// ── 2FA challenge tokens ─────────────────────────────────────────────────────
// After a correct password, the user gets a short-lived challenge token that
// only allows the 2FA step (set up or verify). It is NOT a dashboard login:
// requireAdmin rejects any token that carries a `purpose`.
const CHALLENGE_PURPOSE = "2fa";
const CHALLENGE_EXPIRES_IN = "5m";

function signChallenge(user) {
  return jwt.sign({ sub: user.id, purpose: CHALLENGE_PURPOSE }, SECRET, { expiresIn: CHALLENGE_EXPIRES_IN });
}

/** Payload of a valid 2FA challenge token; throws if invalid, expired or not a challenge. */
function verifyChallenge(token) {
  const payload = jwt.verify(String(token || ""), SECRET);
  if (payload.purpose !== CHALLENGE_PURPOSE) throw new Error("Not a 2FA challenge token");
  return payload;
}

module.exports = { signToken, verifyToken, signChallenge, verifyChallenge };
