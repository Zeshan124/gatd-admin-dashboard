const express = require("express");
const { getPublic, getAdmin, update } = require("../controllers/sitePopupController");
const { requirePermission } = require("../middleware/auth");
// Dashboard section "site_popup": GET needs view access; changes need manage access.
const auth = requirePermission("site_popup");

// Public: the site reads the current popup (null when disabled).
const publicRouter = express.Router();
publicRouter.get("/", getPublic);

// Admin (token required): view / update the popup.
const adminRouter = express.Router();
adminRouter.get("/", auth, getAdmin);
adminRouter.patch("/", auth, update);

module.exports = { publicRouter, adminRouter };
