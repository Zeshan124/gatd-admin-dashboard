// Shared list-endpoint helpers: pagination and whitelisted sorting.

/** Parse ?page/&pageSize into { page, pageSize, offset } (pageSize capped at 100). */
function parsePaging(q) {
  const page = Math.max(1, parseInt(q.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(q.pageSize, 10) || 25));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

/**
 * Parse ?sort=field / -field against a whitelist map { apiKey: columnName }.
 * Returns a safe { field, dir } (field is a real column name, never user input).
 */
function parseSort(q, allowed, def = "sort_order") {
  const raw = String(q.sort || def);
  const dir = raw.startsWith("-") ? "DESC" : "ASC";
  const field = allowed[raw.replace(/^-/, "")] || allowed[def] || Object.values(allowed)[0];
  return { field, dir };
}

/** Standard meta block for paginated responses. */
function pageMeta(page, pageSize, total) {
  return { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 0 };
}

module.exports = { parsePaging, parseSort, pageMeta };
