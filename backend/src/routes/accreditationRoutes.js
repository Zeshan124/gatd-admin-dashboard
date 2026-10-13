const express = require("express");
const { getPublic, getAdmin, update } = require("../controllers/accreditationController");
const { requirePermission } = require("../middleware/auth");
// Dashboard section "accreditation": GET needs view access; changes need manage access.
const auth = requirePermission("accreditation");

// Public: the "Accredited By" section on Program pages reads the current settings.
const publicRouter = express.Router();
publicRouter.get("/", getPublic);

// Admin (token required): view / update the heading + logos.
const adminRouter = express.Router();
adminRouter.get("/", auth, getAdmin);
adminRouter.patch("/", auth, update);

module.exports = { publicRouter, adminRouter };
