// Encrypts small secrets (authenticator keys) before they're stored in the
// database, so a database leak alone doesn't reveal them. AES-256-GCM.
//
// Key: TWO_FACTOR_ENC_KEY env var (64 hex chars = 32 bytes). If it isn't set,
// a key derived from JWT_SECRET is used instead. Decryption tries both, so
// adding TWO_FACTOR_ENC_KEY later doesn't break secrets already saved.
// Never change or lose TWO_FACTOR_ENC_KEY once in use: saved authenticator
// keys could no longer be read, and everyone would need a 2FA reset.

const crypto = require("crypto");

function envKey() {
  const raw = (process.env.TWO_FACTOR_ENC_KEY || "").trim();
  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, "hex");
  return null;
}
function jwtDerivedKey() {
  const s = process.env.JWT_SECRET || "";
  return s ? crypto.createHash("sha256").update(`gatd-2fa:${s}`).digest() : null;
}

if (!envKey()) {
  console.warn("[2fa] TWO_FACTOR_ENC_KEY is not set (or not 64 hex chars) — using a key derived from JWT_SECRET.");
}

function encrypt(plain) {
  const key = envKey() || jwtDerivedKey();
  if (!key) throw new Error("No encryption key: set TWO_FACTOR_ENC_KEY or JWT_SECRET");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${data.toString("base64")}`;
}

function decrypt(box) {
  const [ver, ivB, tagB, dataB] = String(box || "").split(":");
  if (ver !== "v1" || !ivB || !tagB || !dataB) throw new Error("Unrecognised encrypted value");
  const keys = [envKey(), jwtDerivedKey()].filter(Boolean);
  for (const key of keys) {
    try {
      const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivB, "base64"));
      decipher.setAuthTag(Buffer.from(tagB, "base64"));
      return Buffer.concat([decipher.update(Buffer.from(dataB, "base64")), decipher.final()]).toString("utf8");
    } catch {
      /* wrong key — try the next one */
    }
  }
  throw new Error("Could not decrypt the stored authenticator key");
}

module.exports = { encrypt, decrypt };
