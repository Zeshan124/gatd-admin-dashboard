const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/auth");
const { handleUpload } = require("../controllers/uploadController");

// Admin-only asset upload → { data: { url, path, filename, size, mime } }
router.post("/", requireAdmin, handleUpload);

module.exports = router;
