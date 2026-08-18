/** Small display formatters shared across the admin dashboard. */

/** 385000, "SGD" → "SGD 3,850" */
export function formatMoney(cents, currency = "SGD") {
  if (cents == null || Number.isNaN(cents)) return "—";
  return `${currency} ${(cents / 100).toLocaleString()}`;
}

/** ISO string → "7 Aug 2026" */
export function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** ISO string → "7 Aug 2026, 09:14" */
export function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
