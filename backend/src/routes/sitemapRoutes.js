const express = require("express");
const router = express.Router();
const { sitemapSummary } = require("../controllers/sitemapController");
const { requireAdmin } = require("../middleware/auth");

// Admin (token required): JSON summary of the live sitemap for the dashboard.
router.get("/", requireAdmin, sitemapSummary);

module.exports = router;
