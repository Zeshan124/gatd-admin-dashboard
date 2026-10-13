const express = require("express");
const router = express.Router();
const { getOverview } = require("../controllers/statsController");
const { requirePermission } = require("../middleware/auth");
// Dashboard section "overview": GET needs view access; changes need manage access.
const auth = requirePermission("overview");

// Admin (token required): dashboard overview metrics.
router.get("/overview", auth, getOverview);

module.exports = router;
