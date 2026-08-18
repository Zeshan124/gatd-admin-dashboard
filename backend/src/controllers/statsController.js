const { query } = require("../config/db");
const { sendError } = require("../utils/http");

const SERIES_DAYS = 14;

/** Array of { key: value } rows → plain object { key: Number(value) }. */
function toMap(rows, keyField, valField) {
  const m = {};
  for (const r of rows) m[r[keyField]] = Number(r[valField]) || 0;
  return m;
}

/** Per-day counts for the last SERIES_DAYS days (UTC), from a fixed table name. */
function daySeries(table) {
  return query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS d, COUNT(*) AS c
       FROM ${table}
      WHERE delete_status = 0 AND is_spam = 0
        AND created_at >= (UTC_TIMESTAMP() - INTERVAL ${SERIES_DAYS - 1} DAY)
      GROUP BY d`
  );
}

/**
 * GET /apis/stats/overview   (admin, requires token)
 * Aggregated counts across registrations, messages and brochure leads, plus a
 * 14-day submission trend — everything the dashboard needs in one call.
 */
async function getOverview(req, res) {
  try {
    const [
      regAgg,
      regByStatus,
      msgAgg,
      msgByStatus,
      brochAgg,
      brochByType,
      regSeries,
      msgSeries,
      brochSeries,
    ] = await Promise.all([
      query(
        `SELECT COUNT(*) AS allCount,
                SUM(created_at >= DATE_FORMAT(UTC_TIMESTAMP(), '%Y-%m-01')) AS thisMonth,
                SUM(DATE_FORMAT(created_at, '%Y-%m-%d') = DATE_FORMAT(UTC_TIMESTAMP(), '%Y-%m-%d')) AS today,
                COALESCE(SUM(total_amount_cents), 0) AS bookedRevenue,
                COALESCE(SUM(CASE WHEN status IN ('paid','enrolled') THEN total_amount_cents ELSE 0 END), 0) AS realizedRevenue
           FROM registrations WHERE delete_status = 0 AND is_spam = 0`
      ),
      query(`SELECT status, COUNT(*) AS c FROM registrations WHERE delete_status = 0 AND is_spam = 0 GROUP BY status`),
      query(`SELECT COUNT(*) AS allCount, SUM(status = 'new') AS unread FROM contact_messages WHERE delete_status = 0 AND is_spam = 0`),
      query(`SELECT status, COUNT(*) AS c FROM contact_messages WHERE delete_status = 0 AND is_spam = 0 GROUP BY status`),
      query(`SELECT COUNT(*) AS allCount, SUM(status = 'new') AS fresh FROM brochure_leads WHERE delete_status = 0 AND is_spam = 0`),
      query(`SELECT source_type, COUNT(*) AS c FROM brochure_leads WHERE delete_status = 0 AND is_spam = 0 GROUP BY source_type`),
      daySeries("registrations"),
      daySeries("contact_messages"),
      daySeries("brochure_leads"),
    ]);

    // Build a continuous 14-day axis (UTC) and merge the three series onto it.
    const regMap = toMap(regSeries, "d", "c");
    const msgMap = toMap(msgSeries, "d", "c");
    const brochMap = toMap(brochSeries, "d", "c");

    const now = new Date();
    const series = [];
    for (let i = SERIES_DAYS - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
      const date = d.toISOString().slice(0, 10);
      series.push({
        date,
        registrations: regMap[date] || 0,
        messages: msgMap[date] || 0,
        brochures: brochMap[date] || 0,
      });
    }

    return res.json({
      data: {
        totals: {
          registrations: Number(regAgg[0].allCount) || 0,
          messages: Number(msgAgg[0].allCount) || 0,
          brochureLeads: Number(brochAgg[0].allCount) || 0,
        },
        registrations: {
          thisMonth: Number(regAgg[0].thisMonth) || 0,
          today: Number(regAgg[0].today) || 0,
          bookedRevenueCents: Number(regAgg[0].bookedRevenue) || 0,
          realizedRevenueCents: Number(regAgg[0].realizedRevenue) || 0,
          byStatus: toMap(regByStatus, "status", "c"),
        },
        messages: {
          unread: Number(msgAgg[0].unread) || 0,
          byStatus: toMap(msgByStatus, "status", "c"),
        },
        brochureLeads: {
          fresh: Number(brochAgg[0].fresh) || 0,
          byType: toMap(brochByType, "source_type", "c"),
        },
        series,
      },
    });
  } catch (err) {
    console.error("[stats] overview error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not load dashboard stats");
  }
}

module.exports = { getOverview };
