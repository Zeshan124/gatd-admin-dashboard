const express = require("express");
const router = express.Router();
const { createRegistration } = require("../controllers/registrationsController");
const { listRegistrations, getRegistration, exportRegistrations, facetOptions, updateRegistrationStatus, deleteRegistration } = require("../controllers/registrationsAdminController");
const { registrationRateLimit } = require("../middleware/rateLimit");
const { requirePermission } = require("../middleware/auth");
// Dashboard section "registrations": GET needs view access; changes need manage access.
const auth = requirePermission("registrations");

// Public: website Program Registration form submits here.
router.post("/", registrationRateLimit, createRegistration);

// Admin (token required): view / export submitted registrations.
router.get("/", auth, listRegistrations);
router.get("/facets", auth, facetOptions);   // must precede "/:id"
router.get("/export", requirePermission("registrations", "manage"), exportRegistrations); // personal data export needs manage; must precede "/:id"
router.get("/:id", auth, getRegistration);
router.post("/:id/status", auth, updateRegistrationStatus); // change workflow status
router.delete("/:id", auth, deleteRegistration); // soft-delete

module.exports = router;
