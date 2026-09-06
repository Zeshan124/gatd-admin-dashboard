const express = require("express");
const router = express.Router();
const { createLead, listLeads, facets, getLead, updateLead, deleteLead, exportLeads } = require("../controllers/brochureController");
const { brochureRateLimit } = require("../middleware/rateLimit");
const { requireAdmin } = require("../middleware/auth");

// Public: brochure-download forms (Solution + Program pages) submit here.
router.post("/", brochureRateLimit, createLead);

// Admin (token required): view / manage / export leads.
router.get("/", requireAdmin, listLeads);
router.get("/facets", requireAdmin, facets); // must precede "/:id"
router.get("/export", requireAdmin, exportLeads); // must precede "/:id"
router.get("/:id", requireAdmin, getLead);
router.patch("/:id", requireAdmin, updateLead);
router.delete("/:id", requireAdmin, deleteLead);

module.exports = router;
