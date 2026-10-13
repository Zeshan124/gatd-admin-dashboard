const express = require("express");
const router = express.Router();
const { createLead, listLeads, facets, getLead, updateLead, deleteLead, exportLeads } = require("../controllers/brochureController");
const { brochureRateLimit } = require("../middleware/rateLimit");
const { requirePermission } = require("../middleware/auth");
// Dashboard section "brochures": GET needs view access; changes need manage access.
const auth = requirePermission("brochures");

// Public: brochure-download forms (Solution + Program pages) submit here.
router.post("/", brochureRateLimit, createLead);

// Admin (token required): view / manage / export leads.
router.get("/", auth, listLeads);
router.get("/facets", auth, facets); // must precede "/:id"
router.get("/export", requirePermission("brochures", "manage"), exportLeads); // personal data export needs manage; must precede "/:id"
router.get("/:id", auth, getLead);
router.patch("/:id", auth, updateLead);
router.delete("/:id", auth, deleteLead);

module.exports = router;
