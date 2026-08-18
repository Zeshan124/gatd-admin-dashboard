const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/solutionProgramsController");
const { requireAdmin } = require("../middleware/auth");

router.use(requireAdmin);

router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.post("/reorder", ctrl.reorder);
router.get("/:slug", ctrl.getOne);
router.patch("/:slug", ctrl.update);
router.delete("/:slug", ctrl.remove);

module.exports = router;
