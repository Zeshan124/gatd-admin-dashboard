const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/blogController");

// Public, unauthenticated read API for the blog.
// NOTE: /slugs must be declared before /:slug so it isn't captured as a slug.
router.get("/", ctrl.listPublic);
router.get("/slugs", ctrl.publicSlugs);
router.get("/:slug", ctrl.getPublicBySlug);

module.exports = router;
