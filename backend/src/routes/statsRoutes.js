const express = require("express");
const router = express.Router();
const { getOverview } = require("../controllers/statsController");
const { requireAdmin } = require("../middleware/auth");

// Admin (token required): dashboard overview metrics.
router.get("/overview", requireAdmin, getOverview);

module.exports = router;
