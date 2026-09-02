const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const { sendError } = require("../utils/http");

// Files land in <app-root>/uploads and are served statically at /uploads
// (see app.js). Kept outside src/ so a code re-deploy never overwrites them.
const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// mime → extension whitelist (raster images + SVG icons + PDF brochures).
// SVG can embed <script>; it's allowed for icons but the /uploads responses are
// served with `X-Content-Type-Options: nosniff` + a restrictive CSP `sandbox`
// (see app.js), so an SVG opened directly from the uploads origin can't execute
// script (defence against stored XSS).
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/svg+xml", "svg"],
  ["application/pdf", "pdf"],
]);

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = ALLOWED.get(file.mimetype) || "bin";
    const base =
      path
        .basename(file.originalname, path.extname(file.originalname))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || "file";
    const rand = crypto.randomBytes(6).toString("hex");
    cb(null, `${Date.now()}-${rand}-${base}.${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter: (req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) return cb(null, true);
    cb(new Error("UNSUPPORTED_TYPE"));
  },
}).single("file");

// POST /apis/admin/uploads  (multipart/form-data, field name "file")
function handleUpload(req, res) {
  upload(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return sendError(res, 413, "FILE_TOO_LARGE", "File exceeds the 8 MB limit");
      }
      if (err.message === "UNSUPPORTED_TYPE") {
        return sendError(res, 415, "UNSUPPORTED_TYPE", "Only images (jpg, png, webp, gif, svg) and PDF files are allowed");
      }
      console.error("[upload] error:", err);
      return sendError(res, 500, "UPLOAD_ERROR", "Could not process the upload");
    }
    if (!req.file) {
      return sendError(res, 422, "NO_FILE", "No file received (the form field must be named 'file')");
    }

    // Prefer a configured public base URL so the returned URL never trusts the
    // client-supplied Host header. Fall back to the request origin in local dev.
    const relPath = `/uploads/${req.file.filename}`;
    const base = (process.env.UPLOADS_BASE_URL || "").replace(/\/+$/, "");
    const origin = base || `${req.protocol}://${req.get("host")}`;
    return res.status(201).json({
      data: {
        url: `${origin}${relPath}`,
        path: relPath,
        filename: req.file.filename,
        size: req.file.size,
        mime: req.file.mimetype,
      },
    });
  });
}

module.exports = { handleUpload, UPLOADS_DIR };
