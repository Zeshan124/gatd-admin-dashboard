const { query, withTransaction } = require("../config/db");
const { validateRegistration } = require("../utils/validate");
const { dialCodeFor } = require("../utils/countries");
const { formatMoney } = require("../utils/money");
const { nextReferenceNo } = require("../utils/reference");
const { sendError } = require("../utils/http");
const { sendRegistrationEmails } = require("../utils/registrationEmails");
const { scoreSubmission } = require("../utils/spamFilter");

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

    // 2) Look up selected programmes for server-authoritative pricing. Check the
    //    legacy registrations catalog first, then the Solutions CMS
    //    (solution_programs) for any slug not found there — so CMS Subprograms
    //    (which aren't in the old catalog) are registrable too. CMS items carry a
    //    NULL program_id (registration_programs.program_id is nullable).
    const placeholders = value.programSlugs.map(() => "?").join(", ");
    let programs = await query(
      `SELECT id, slug, title, price_cents, currency
         FROM programs
        WHERE is_active = 1 AND slug IN (${placeholders})`,
      value.programSlugs
    );
    const foundInCatalog = new Set(programs.map((p) => p.slug));
    const missingSlugs = value.programSlugs.filter((s) => !foundInCatalog.has(s));
    if (missingSlugs.length) {
      const ph2 = missingSlugs.map(() => "?").join(", ");
      const cmsPrograms = await query(
        `SELECT NULL AS id, slug, title, price_cents, currency
           FROM solution_programs
          WHERE is_published = 1 AND is_active = 1 AND delete_status = 0 AND price_cents IS NOT NULL
            AND slug IN (${ph2})`,
        missingSlugs
      );
      programs = programs.concat(cmsPrograms);
    }

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

    // Spam heuristics — mark (not reject); spam-flagged registrations skip emails.
    const sc = scoreSubmission({
      name: [value.firstName, value.lastName].filter(Boolean).join(" "),
      email: value.email,
      organization: value.organization,
    });
    const isSpam = sc.spam;
    if (isSpam) console.warn(`[registrations] flagged spam (${sc.reasons.join(", ")}) from ${value.email}`);

    // 6) Persist atomically: reference number + registration + line items.
    const referenceNo = await withTransaction(async (tx) => {
      const ref = await nextReferenceNo(tx, year);

      const result = await tx.query(
        `INSERT INTO registrations
           (reference_no, first_name, last_name, email, phone_country, phone_dial_code,
            phone_number, country, designation, organization, hear_about_us,
            currency, total_amount_cents, status,
            source_page, utm_source, utm_medium, utm_campaign, ip_address, user_agent, is_spam)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?)`,
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
          isSpam ? 1 : 0,
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

    // 7) Fire the confirmation + internal-notification emails. Best-effort and
    // fire-and-forget: never block or fail the response on email trouble.
    // Spam-flagged submissions are saved (hidden) but don't trigger emails.
    if (!isSpam) {
      sendRegistrationEmails({
        value,
        dialCode,
        referenceNo,
        programs,
        currency,
        totalAmountCents,
      }).catch((err) => console.error("[registrations] email error:", err));
    }

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
