const express = require("express");
const { getPublic, getAdmin, update } = require("../controllers/accreditationController");
const { requireAdmin } = require("../middleware/auth");

// Public: the "Accredited By" section on Program pages reads the current settings.
const publicRouter = express.Router();
publicRouter.get("/", getPublic);

// Admin (token required): view / update the heading + logos.
const adminRouter = express.Router();
adminRouter.get("/", requireAdmin, getAdmin);
adminRouter.patch("/", requireAdmin, update);

module.exports = { publicRouter, adminRouter };
