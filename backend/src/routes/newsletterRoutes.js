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
const { requireAdmin } = require("../middleware/auth");

// Public: website footer newsletter form submits here.
router.post("/", newsletterRateLimit, createSubscription);

// Admin (token required): view / manage subscribers.
router.get("/", requireAdmin, listSubscribers);
router.get("/export", requireAdmin, exportSubscribers); // must precede "/:id"
router.get("/:id", requireAdmin, getSubscriber);
router.patch("/:id", requireAdmin, updateSubscriber);
router.delete("/:id", requireAdmin, deleteSubscriber);

module.exports = router;
