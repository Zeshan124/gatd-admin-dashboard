// Helpers for JSON columns. In MariaDB, JSON is stored as LONGTEXT and the
// mysql driver returns it as a string, so reads must be parsed and writes
// stringified.

/** Parse a JSON column value coming back from the DB. Returns null on empty/invalid. */
function parseJson(value) {
  if (value == null) return null;
  if (typeof value === "object") return value; // already parsed (some drivers)
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/** Stringify a value for storage in a JSON column (null stays null). */
function toJsonColumn(value) {
  if (value === undefined || value === null) return null;
  return JSON.stringify(value);
}

module.exports = { parseJson, toJsonColumn };
