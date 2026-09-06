// Lightweight in-memory rate limiter for public submission endpoints (§10).
// NOTE: state is per-process — fine for a single instance. If you scale to
// multiple instances/workers, replace this with a shared store (e.g. Redis).

const { sendError } = require("../utils/http");

const IS_PROD = process.env.NODE_ENV === "production";
// Explicit kill switch (any env): RATE_LIMIT_DISABLED=true
const RATE_LIMIT_DISABLED = process.env.RATE_LIMIT_DISABLED === "true";
// Loopback addresses — the same machine as the server.
const LOOPBACK = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

/**
 * Build a per-IP rate-limit middleware with its own independent counters.
 * @param {Array<{ms:number, max:number}>} windows  e.g. [{ ms, max }, …]
 */
function createRateLimit(windows) {
  const maxWindowMs = Math.max(...windows.map((w) => w.ms));
  const hits = new Map(); // ip -> array of request timestamps (ms)

  // Periodic sweep so the map doesn't grow unbounded from one-off IPs.
  const sweep = setInterval(() => {
    const cutoff = Date.now() - maxWindowMs;
    for (const [ip, times] of hits) {
      const kept = times.filter((t) => t > cutoff);
      if (kept.length) hits.set(ip, kept);
      else hits.delete(ip);
    }
  }, 60 * 1000);
  if (sweep.unref) sweep.unref(); // don't keep the process alive for the timer

  return function rateLimit(req, res, next) {
    if (RATE_LIMIT_DISABLED) return next();
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    // Don't rate-limit local testing from the same machine (dev only).
    if (!IS_PROD && LOOPBACK.has(ip)) return next();
    const now = Date.now();
    const recent = (hits.get(ip) || []).filter((t) => t > now - maxWindowMs);

    for (const w of windows) {
      const countInWindow = recent.filter((t) => t > now - w.ms).length;
      if (countInWindow >= w.max) {
        res.set("Retry-After", String(Math.ceil(w.ms / 1000)));
        return sendError(res, 429, "RATE_LIMITED", "Too many submissions. Please try again later.");
      }
    }

    recent.push(now);
    hits.set(ip, recent);
    next();
  };
}

// 5 per 10 min + 50 per day, per IP. Each endpoint gets its own counters.
const STANDARD_WINDOWS = [
  { ms: 10 * 60 * 1000, max: 5 },
  { ms: 24 * 60 * 60 * 1000, max: 50 },
];

const registrationRateLimit = createRateLimit(STANDARD_WINDOWS);
const contactRateLimit = createRateLimit(STANDARD_WINDOWS);
const newsletterRateLimit = createRateLimit(STANDARD_WINDOWS);
// Brochure downloads can happen a bit more often as a visitor browses programmes.
const brochureRateLimit = createRateLimit([
  { ms: 10 * 60 * 1000, max: 10 },
  { ms: 24 * 60 * 60 * 1000, max: 80 },
]);

module.exports = { createRateLimit, registrationRateLimit, contactRateLimit, newsletterRateLimit, brochureRateLimit };
