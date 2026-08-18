// Reference-number generation. MySQL has no sequences, so we keep a per-year
// counter row in the `counters` table and bump it atomically inside the
// registration transaction using the LAST_INSERT_ID(expr) trick — this returns
// the new value on the same connection with no race between concurrent inserts.

/**
 * Reserve the next per-year sequence number within a transaction and return a
 * formatted reference like "REG-2026-000123".
 * @param {{ query: (sql: string, params?: Array) => Promise<any> }} tx  transaction handle from withTransaction
 * @param {number} year  4-digit year (UTC) to scope the sequence to
 * @returns {Promise<string>}
 */
async function nextReferenceNo(tx, year) {
  const counterName = `reg-${year}`;

  // Atomically increment (or create) the counter and read the new value back.
  await tx.query(
    `INSERT INTO counters (name, value) VALUES (?, LAST_INSERT_ID(1))
     ON DUPLICATE KEY UPDATE value = LAST_INSERT_ID(value + 1)`,
    [counterName]
  );
  const rows = await tx.query(`SELECT LAST_INSERT_ID() AS seq`);
  const seq = rows[0].seq;

  return `REG-${year}-${String(seq).padStart(6, "0")}`;
}

module.exports = { nextReferenceNo };
