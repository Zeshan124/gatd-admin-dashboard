const express = require("express");
const router = express.Router();
const { createContact, listContact, getContact, updateContact, deleteContact, exportContact } = require("../controllers/contactController");
const { contactRateLimit } = require("../middleware/rateLimit");
const { requireAdmin } = require("../middleware/auth");

// Public: website "Get In Touch" contact form submits here.
router.post("/", contactRateLimit, createContact);

// Admin (token required): view / manage submitted messages.
router.get("/", requireAdmin, listContact);
router.get("/export", requireAdmin, exportContact); // must precede "/:id"
router.get("/:id", requireAdmin, getContact);
router.patch("/:id", requireAdmin, updateContact);
router.delete("/:id", requireAdmin, deleteContact);

module.exports = router;
