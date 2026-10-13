const express = require("express");
const { getPublic, getAdmin, update } = require("../controllers/companyProfileController");
const { requirePermission } = require("../middleware/auth");
// Dashboard section "company_profile": GET needs view access; changes need manage access.
const auth = requirePermission("company_profile");

// Public: the header popup reads the current settings (PDF + copy).
const publicRouter = express.Router();
publicRouter.get("/", getPublic);

// Admin (token required): view / update the settings.
const adminRouter = express.Router();
adminRouter.get("/", auth, getAdmin);
adminRouter.patch("/", auth, update);

module.exports = { publicRouter, adminRouter };
