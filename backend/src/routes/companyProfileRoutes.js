const express = require("express");
const { getPublic, getAdmin, update } = require("../controllers/companyProfileController");
const { requireAdmin } = require("../middleware/auth");

// Public: the header popup reads the current settings (PDF + copy).
const publicRouter = express.Router();
publicRouter.get("/", getPublic);

// Admin (token required): view / update the settings.
const adminRouter = express.Router();
adminRouter.get("/", requireAdmin, getAdmin);
adminRouter.patch("/", requireAdmin, update);

module.exports = { publicRouter, adminRouter };
