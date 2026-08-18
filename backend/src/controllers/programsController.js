const { query } = require("../config/db");
const { formatMoney } = require("../utils/money");
const { sendError } = require("../utils/http");

/**
 * GET /apis/programs
 * Public: list active programmes with authoritative pricing so the website can
 * render the catalog (and submit stable slugs).
 */
async function listPrograms(req, res) {
  try {
    const rows = await query(
      `SELECT slug, title, price_cents, currency
         FROM programs
        WHERE is_active = 1
        ORDER BY sort_order ASC, title ASC`
    );

    const data = rows.map((p) => ({
      slug: p.slug,
      title: p.title,
      priceCents: p.price_cents,
      priceFormatted: formatMoney(p.price_cents, p.currency),
      currency: p.currency,
    }));

    return res.json({ data });
  } catch (err) {
    console.error("[programs] list error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load programmes");
  }
}

module.exports = { listPrograms };
