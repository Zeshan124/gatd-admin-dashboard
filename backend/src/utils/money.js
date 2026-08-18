// Money is stored and computed as integer minor units (cents). Formatting is a
// display concern only.

/**
 * Format integer cents as a human-readable string, e.g. (665000, 'SGD') -> "SGD 6,650".
 * Shows decimals only when the amount is not a whole currency unit.
 * @param {number} cents
 * @param {string} currency ISO-4217 code, e.g. 'SGD'
 * @returns {string}
 */
function formatMoney(cents, currency = "SGD") {
  const amount = (Number(cents) || 0) / 100;
  const hasFraction = Math.round(amount * 100) % 100 !== 0;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${currency} ${formatted}`;
}

module.exports = { formatMoney };
