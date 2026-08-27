const express = require("express");
const router = express.Router();
const { createRegistration } = require("../controllers/registrationsController");
const { listRegistrations, getRegistration, exportRegistrations, facetOptions, updateRegistrationStatus } = require("../controllers/registrationsAdminController");
const { registrationRateLimit } = require("../middleware/rateLimit");
const { requireAdmin } = require("../middleware/auth");

// Public: website Program Registration form submits here.
router.post("/", registrationRateLimit, createRegistration);

// Admin (token required): view / export submitted registrations.
router.get("/", requireAdmin, listRegistrations);
router.get("/facets", requireAdmin, facetOptions);   // must precede "/:id"
router.get("/export", requireAdmin, exportRegistrations); // must precede "/:id"
router.get("/:id", requireAdmin, getRegistration);
router.post("/:id/status", requireAdmin, updateRegistrationStatus); // change workflow status

module.exports = router;
