const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/parentSolutionsController");
const child = require("../controllers/childSolutionsController");
const { requireAdmin } = require("../middleware/auth");

// All admin content routes require a valid admin token.
router.use(requireAdmin);

router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.post("/reorder", ctrl.reorder);
router.get("/:slug", ctrl.getOne);
router.patch("/:slug", ctrl.update);
router.delete("/:slug", ctrl.remove);
router.get("/:slug/children", child.listByParent);

module.exports = router;
