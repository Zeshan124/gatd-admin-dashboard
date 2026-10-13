const express = require("express");
const router = express.Router();
const { requireAnyPermission } = require("../middleware/auth");
const { CONTENT_MODULES } = require("../utils/permissions");
const { handleUpload } = require("../controllers/uploadController");

// Asset upload → { data: { url, path, filename, size, mime } }
// Allowed for anyone who can manage at least one content section
// (Solutions, Blog, Company Profile, Website Popup, Accredited By).
router.post("/", requireAnyPermission(CONTENT_MODULES, "manage"), handleUpload);

module.exports = router;
