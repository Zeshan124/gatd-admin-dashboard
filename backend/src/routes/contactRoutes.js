const express = require("express");
const router = express.Router();
const { createContact, listContact, getContact, updateContact, deleteContact, exportContact } = require("../controllers/contactController");
const { contactRateLimit } = require("../middleware/rateLimit");
const { requirePermission } = require("../middleware/auth");
// Dashboard section "messages": GET needs view access; changes need manage access.
const auth = requirePermission("messages");

// Public: website "Get In Touch" contact form submits here.
router.post("/", contactRateLimit, createContact);

// Admin (token required): view / manage submitted messages.
router.get("/", auth, listContact);
router.get("/export", requirePermission("messages", "manage"), exportContact); // personal data export needs manage; must precede "/:id"
router.get("/:id", auth, getContact);
router.patch("/:id", auth, updateContact);
router.delete("/:id", auth, deleteContact);

module.exports = router;
