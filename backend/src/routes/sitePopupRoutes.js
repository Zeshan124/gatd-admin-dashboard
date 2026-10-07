const express = require("express");
const { getPublic, getAdmin, update } = require("../controllers/sitePopupController");
const { requireAdmin } = require("../middleware/auth");

// Public: the site reads the current popup (null when disabled).
const publicRouter = express.Router();
publicRouter.get("/", getPublic);

// Admin (token required): view / update the popup.
const adminRouter = express.Router();
adminRouter.get("/", requireAdmin, getAdmin);
adminRouter.patch("/", requireAdmin, update);

module.exports = { publicRouter, adminRouter };
