const express = require("express");
const router = express.Router();
const {
  createSubscription,
  listSubscribers,
  getSubscriber,
  updateSubscriber,
  deleteSubscriber,
  exportSubscribers,
} = require("../controllers/newsletterController");
const { newsletterRateLimit } = require("../middleware/rateLimit");
const { requirePermission } = require("../middleware/auth");
// Dashboard section "newsletter": GET needs view access; changes need manage access.
const auth = requirePermission("newsletter");

// Public: website footer newsletter form submits here.
router.post("/", newsletterRateLimit, createSubscription);

// Admin (token required): view / manage subscribers.
router.get("/", auth, listSubscribers);
router.get("/export", requirePermission("newsletter", "manage"), exportSubscribers); // personal data export needs manage; must precede "/:id"
router.get("/:id", auth, getSubscriber);
router.patch("/:id", auth, updateSubscriber);
router.delete("/:id", auth, deleteSubscriber);

module.exports = router;
