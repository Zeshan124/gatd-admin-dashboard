// Time-based one-time passwords (RFC 6238) — what Google Authenticator,
// Microsoft Authenticator, Authy etc. generate. Built on Node's crypto, so no
// extra npm package is needed. Settings match Google Authenticator's defaults:
// SHA-1, 6 digits, 30-second steps.

const crypto = require("crypto");

const PERIOD = 30; // seconds per code
const DIGITS = 6;
const ISSUER = "GATD Dashboard";
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buf) {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(str) {
  const clean = String(str).toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const ch of clean) {
    value = (value << 5) | B32.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/** New random secret (160 bits), Base32 — the value encoded in the QR code. */
function generateSecret() {
  return base32Encode(crypto.randomBytes(20));
}

/** The code for a given 30-second time step. */
function codeAt(secret, step) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const hmac = crypto.createHmac("sha1", base32Decode(secret)).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3];
  return String(binary % 10 ** DIGITS).padStart(DIGITS, "0");
}

const currentStep = (now = Date.now()) => Math.floor(now / 1000 / PERIOD);

/**
 * Check a 6-digit code. Accepts the current step and one step either side
 * (allows ~30s of clock drift between phone and server).
 * Returns the matched time step, or null. Pass `lastStep` (the last step this
 * account used) to refuse re-using the same or an older code.
 */
function verifyCode(secret, code, { lastStep = null, window = 1 } = {}) {
  const c = String(code || "").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(c)) return null;
  const now = currentStep();
  for (let i = -window; i <= window; i++) {
    const step = now + i;
    if (lastStep != null && step <= lastStep) continue; // already used
    const expected = codeAt(secret, step);
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(c))) return step;
  }
  return null;
}

/** otpauth:// link that authenticator apps read from the QR code. */
function otpauthUrl(secret, accountName) {
  const label = encodeURIComponent(`${ISSUER}:${accountName}`);
  const params = new URLSearchParams({
    secret,
    issuer: ISSUER,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(PERIOD),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

module.exports = { generateSecret, verifyCode, otpauthUrl, codeAt, currentStep, ISSUER };
