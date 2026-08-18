const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

/** Hash a plaintext password. */
function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/** Compare a plaintext password against a stored bcrypt hash. */
function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = { hashPassword, verifyPassword };
