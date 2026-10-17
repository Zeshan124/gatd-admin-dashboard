const crypto = require("crypto");
const { query } = require("../config/db");
const { signToken, verifyChallenge } = require("../utils/jwt");
const { sendError } = require("../utils/http");
const { generateSecret, verifyCode, otpauthUrl, ISSUER } = require("../utils/totp");
const { encrypt, decrypt } = require("../utils/secretBox");
const { publicUser } = require("./authController");

// Two-factor authentication for dashboard sign-in (required for everyone).
//
// Flow: POST /auth/login (password OK) → { twoFactor: "setup" | "verify", challengeToken }
//   setup:  POST /auth/2fa/setup  { challengeToken }        → QR code data
//           POST /auth/2fa/enable { challengeToken, code }  → login token + backup codes
//   verify: POST /auth/2fa/verify { challengeToken, code }  → login token
// `code` on verify may be a 6-digit authenticator code or a one-time backup code.

const BACKUP_CODE_COUNT = 10;
const BACKUP_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

// Wrong codes per account: max 5 per 15 minutes, then a short lock-out.
const MAX_FAILURES = 5;
const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const failures = new Map(); // account id -> [timestamps]

function recentFailures(id) {
  const cutoff = Date.now() - FAILURE_WINDOW_MS;
  const list = (failures.get(id) || []).filter((t) => t > cutoff);
  failures.set(id, list);
  return list;
}
const recordFailure = (id) => recentFailures(id).push(Date.now());
const clearFailures = (id) => failures.delete(id);

const normaliseBackup = (c) => String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const hashBackup = (c) => crypto.createHash("sha256").update(normaliseBackup(c)).digest("hex");

function newBackupCodes() {
  const codes = [];
  for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
    let raw = "";
    for (let j = 0; j < 8; j++) raw += BACKUP_ALPHABET[crypto.randomInt(BACKUP_ALPHABET.length)];
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4)}`);
  }
  return codes;
}

function parseJsonArray(v) {
  if (Array.isArray(v)) return v;
  try {
    const a = JSON.parse(v);
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

async function loadAccount(id) {
  const rows = await query(
    `SELECT id, name, email, role, permissions, is_active,
            totp_secret, totp_enabled, totp_last_step, totp_backup_codes
       FROM admin_users WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/** Resolve the challenge token to an active account, or send the error and return null. */
async function accountFromChallenge(req, res) {
  let payload;
  try {
    payload = verifyChallenge(req.body?.challengeToken);
  } catch (err) {
    const expired = err && err.name === "TokenExpiredError";
    sendError(
      res,
      401,
      expired ? "CHALLENGE_EXPIRED" : "INVALID_CHALLENGE",
      expired ? "This sign-in attempt expired. Please sign in again." : "Please sign in again."
    );
    return null;
  }
  const user = await loadAccount(payload.sub);
  if (!user || !user.is_active) {
    sendError(res, 401, "INVALID_CHALLENGE", "Please sign in again.");
    return null;
  }
  if (recentFailures(user.id).length >= MAX_FAILURES) {
    sendError(res, 429, "TOO_MANY_ATTEMPTS", "Too many incorrect codes. Please wait 15 minutes and try again.");
    return null;
  }
  return user;
}

const wrongCode = (res, user, message = "That code isn't correct. Please try again.") => {
  recordFailure(user.id);
  return sendError(res, 422, "INVALID_CODE", message, { code: message });
};

/** Complete sign-in: record it and return the real dashboard login token. */
async function finishLogin(user) {
  await query(`UPDATE admin_users SET last_login_at = UTC_TIMESTAMP() WHERE id = ?`, [user.id]);
  clearFailures(user.id);
  return { token: signToken(user), user: publicUser(user) };
}

// POST /apis/auth/2fa/setup   { challengeToken }
// Creates a new authenticator key (replacing any unconfirmed one) and returns
// what the QR code needs. 2FA isn't on until /enable confirms a code.
async function setup(req, res) {
  try {
    const user = await accountFromChallenge(req, res);
    if (!user) return;
    if (user.totp_enabled) {
      return sendError(res, 409, "ALREADY_ENABLED", "Two-factor authentication is already set up for this account.");
    }
    const secret = generateSecret();
    await query(`UPDATE admin_users SET totp_secret = ?, totp_last_step = NULL WHERE id = ?`, [encrypt(secret), user.id]);
    return res.json({
      data: {
        otpauthUrl: otpauthUrl(secret, user.email),
        secret, // for typing in manually if the QR code can't be scanned
        issuer: ISSUER,
        account: user.email,
      },
    });
  } catch (err) {
    console.error("[2fa] setup error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not start two-factor setup");
  }
}

// POST /apis/auth/2fa/enable   { challengeToken, code }
async function enable(req, res) {
  try {
    const user = await accountFromChallenge(req, res);
    if (!user) return;
    if (user.totp_enabled) {
      return sendError(res, 409, "ALREADY_ENABLED", "Two-factor authentication is already set up for this account.");
    }
    if (!user.totp_secret) {
      return sendError(res, 422, "SETUP_NOT_STARTED", "Please scan the QR code first.");
    }
    const step = verifyCode(decrypt(user.totp_secret), req.body?.code);
    if (step === null) return wrongCode(res, user);

    const backupCodes = newBackupCodes();
    await query(
      `UPDATE admin_users
          SET totp_enabled = 1, totp_last_step = ?, totp_backup_codes = ?, totp_enabled_at = UTC_TIMESTAMP()
        WHERE id = ?`,
      [step, JSON.stringify(backupCodes.map(hashBackup)), user.id]
    );
    const session = await finishLogin(user);
    return res.json({ data: { ...session, backupCodes } });
  } catch (err) {
    console.error("[2fa] enable error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not turn on two-factor authentication");
  }
}

// POST /apis/auth/2fa/verify   { challengeToken, code }   (code = 6 digits or a backup code)
async function verify(req, res) {
  try {
    const user = await accountFromChallenge(req, res);
    if (!user) return;
    if (!user.totp_enabled || !user.totp_secret) {
      return sendError(res, 409, "SETUP_REQUIRED", "Two-factor authentication needs to be set up first.");
    }

    const code = String(req.body?.code || "").trim();

    // 6-digit authenticator code.
    if (/^\d{6}$/.test(code.replace(/\s+/g, ""))) {
      const step = verifyCode(decrypt(user.totp_secret), code, { lastStep: user.totp_last_step });
      if (step === null) return wrongCode(res, user);
      await query(`UPDATE admin_users SET totp_last_step = ? WHERE id = ?`, [step, user.id]);
      return res.json({ data: await finishLogin(user) });
    }

    // One-time backup code.
    const hashes = parseJsonArray(user.totp_backup_codes);
    const hit = hashes.indexOf(hashBackup(code));
    if (!normaliseBackup(code) || hit === -1) {
      return wrongCode(res, user, "That code isn't correct. Enter the 6-digit code from your app, or a backup code.");
    }
    hashes.splice(hit, 1); // each backup code works once
    await query(`UPDATE admin_users SET totp_backup_codes = ? WHERE id = ?`, [JSON.stringify(hashes), user.id]);
    return res.json({ data: { ...(await finishLogin(user)), usedBackupCode: true, backupCodesRemaining: hashes.length } });
  } catch (err) {
    console.error("[2fa] verify error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not verify the code");
  }
}

module.exports = { setup, enable, verify };
