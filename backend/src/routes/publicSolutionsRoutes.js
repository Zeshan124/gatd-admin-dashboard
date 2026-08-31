const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/publicSolutionsController");

// Public, unauthenticated read API (consumed by the static site at build time).
router.get("/solutions", ctrl.catalog);
router.get("/solutions/menu", ctrl.menu); // must precede "/solutions/:parentSlug"
router.get("/solutions/:parentSlug", ctrl.parent);
router.get("/child-solutions/:slug", ctrl.child);
router.get("/programs", ctrl.programsList);
router.get("/programs/:slug", ctrl.program);

module.exports = router;
