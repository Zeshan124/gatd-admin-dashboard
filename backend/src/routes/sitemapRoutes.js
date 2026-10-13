const express = require("express");
const router = express.Router();
const { sitemapSummary } = require("../controllers/sitemapController");
const { requirePermission } = require("../middleware/auth");
// Dashboard section "sitemap": GET needs view access; changes need manage access.
const auth = requirePermission("sitemap");

// Admin (token required): JSON summary of the live sitemap for the dashboard.
router.get("/", auth, sitemapSummary);

module.exports = router;
