const { query, withTransaction } = require("../config/db");
const { validateRegistration } = require("../utils/validate");
const { dialCodeFor } = require("../utils/countries");
const { formatMoney } = require("../utils/money");
const { nextReferenceNo } = require("../utils/reference");
const { sendError } = require("../utils/http");

// Window (minutes) within which an identical resubmission is treated as a
// duplicate and returns the existing reference instead of creating a new row.
const DEDUPE_WINDOW_MINUTES = 10;

/** Build the public success payload (omits all internal fields). */
function publicPayload({ referenceNo, status, currency, totalAmountCents, programs }) {
  return {
    data: {
      referenceNo,
      status,
      currency,
      totalAmountCents,
      totalAmountFormatted: formatMoney(totalAmountCents, currency),
      programs: programs.map((p) => ({
        slug: p.slug,
        title: p.title,
        unitPriceCents: p.unit_price_cents != null ? p.unit_price_cents : p.price_cents,
      })),
    },
  };
}

/** Return an existing registration (id) that matches the submitted slug set, or null. */
async function findRecentDuplicate(email, slugSet) {
  const candidates = await query(
    `SELECT id, reference_no, status, currency, total_amount_cents
       FROM registrations
      WHERE email = ?
        AND is_spam = 0
        AND delete_status = 0
        AND created_at >= (UTC_TIMESTAMP() - INTERVAL ? MINUTE)
      ORDER BY created_at DESC
      LIMIT 20`,
    [email, DEDUPE_WINDOW_MINUTES]
  );

  for (const cand of candidates) {
    const items = await query(
      `SELECT program_slug, program_title, unit_price_cents
         FROM registration_programs
        WHERE registration_id = ?`,
      [cand.id]
    );
    const candSet = items.map((i) => i.program_slug).sort();
    const wanted = [...slugSet].sort();
    if (candSet.length === wanted.length && candSet.every((s, i) => s === wanted[i])) {
      return {
        referenceNo: cand.reference_no,
        status: cand.status,
        currency: cand.currency,
        totalAmountCents: cand.total_amount_cents,
        programs: items.map((i) => ({
          slug: i.program_slug,
          title: i.program_title,
          unit_price_cents: i.unit_price_cents,
        })),
      };
    }
  }
  return null;
}

/**
 * POST /apis/registrations
 * Public: capture a program-registration submission. Validates input, prices it
 * server-side from the `programs` catalog, and persists it atomically.
 */
async function createRegistration(req, res) {
  try {
    // Honeypot: hidden field that only bots fill. Accept-and-drop silently.
    if (typeof req.body.honeypot === "string" && req.body.honeypot.trim() !== "") {
      return res.status(201).json({
        data: { referenceNo: null, status: "received", currency: "SGD", totalAmountCents: 0, totalAmountFormatted: "SGD 0", programs: [] },
      });
    }

    // 1) Validate + normalize input.
    const { valid, errors, value } = validateRegistration(req.body);
    if (!valid) {
      return sendError(res, 422, "VALIDATION_ERROR", "One or more fields are invalid", errors);
    }

    // 2) Look up selected programmes in the catalog (server-authoritative pricing).
    const placeholders = value.programSlugs.map(() => "?").join(", ");
    const programs = await query(
      `SELECT id, slug, title, price_cents, currency
         FROM programs
        WHERE is_active = 1 AND slug IN (${placeholders})`,
      value.programSlugs
    );

    if (programs.length !== value.programSlugs.length) {
      const found = new Set(programs.map((p) => p.slug));
      const unknown = value.programSlugs.filter((s) => !found.has(s));
      return sendError(res, 422, "VALIDATION_ERROR", "One or more programmes are unavailable", {
        programSlugs: `Unknown or inactive programme(s): ${unknown.join(", ")}`,
      });
    }

    // 3) Single-currency assertion + total (never trust the client's totalAmount).
    const currency = programs[0].currency;
    if (!programs.every((p) => p.currency === currency)) {
      return sendError(res, 422, "CURRENCY_MISMATCH", "Selected programmes must share a single currency");
    }
    const totalAmountCents = programs.reduce((sum, p) => sum + p.price_cents, 0);

    // 4) Idempotency: identical resubmission within the dedupe window.
    const dup = await findRecentDuplicate(value.email, value.programSlugs);
    if (dup) {
      return res.status(200).json(publicPayload(dup));
    }

    // 5) Derive dial code; capture provenance.
    const dialCode = dialCodeFor(value.phoneCountry);
    const ip = (req.ip || "").slice(0, 45) || null;
    const userAgent = (req.headers["user-agent"] || "").toString() || null;
    const year = new Date().getUTCFullYear();

    // 6) Persist atomically: reference number + registration + line items.
    const referenceNo = await withTransaction(async (tx) => {
      const ref = await nextReferenceNo(tx, year);

      const result = await tx.query(
        `INSERT INTO registrations
           (reference_no, first_name, last_name, email, phone_country, phone_dial_code,
            phone_number, country, designation, organization, hear_about_us,
            currency, total_amount_cents, status,
            source_page, utm_source, utm_medium, utm_campaign, ip_address, user_agent, is_spam)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, 0)`,
        [
          ref,
          value.firstName,
          value.lastName,
          value.email,
          value.phoneCountry,
          dialCode,
          value.phoneNumber,
          value.country,
          value.designation,
          value.organization,
          value.hearAboutUs,
          currency,
          totalAmountCents,
          value.sourcePage,
          value.utm.source,
          value.utm.medium,
          value.utm.campaign,
          ip,
          userAgent,
        ]
      );
      const registrationId = result.insertId;

      for (const p of programs) {
        await tx.query(
          `INSERT INTO registration_programs
             (registration_id, program_id, program_slug, program_title, unit_price_cents, currency)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [registrationId, p.id, p.slug, p.title, p.price_cents, p.currency]
        );
      }

      return ref;
    });

    return res.status(201).json(
      publicPayload({
        referenceNo,
        status: "new",
        currency,
        totalAmountCents,
        programs,
      })
    );
  } catch (err) {
    console.error("[registrations] create error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Could not process the registration. Please try again.");
  }
}

module.exports = { createRegistration };
