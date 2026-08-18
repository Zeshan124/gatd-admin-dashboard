// Consistent JSON error envelope (§5 of the spec):
//   { "error": { "code": "...", "message": "...", "fields": { ... } } }

/**
 * Send a JSON error response.
 * @param {import('express').Response} res
 * @param {number} status HTTP status code
 * @param {string} code   machine-readable code, e.g. 'VALIDATION_ERROR'
 * @param {string} message human-readable message
 * @param {Record<string,string>} [fields] optional per-field messages
 */
function sendError(res, status, code, message, fields) {
  const error = { code, message };
  if (fields && Object.keys(fields).length) error.fields = fields;
  return res.status(status).json({ error });
}

module.exports = { sendError };
