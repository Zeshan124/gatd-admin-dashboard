const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/solutionProgramsController");
const { requirePermission } = require("../middleware/auth");
// Dashboard section "solutions": GET needs view access; changes need manage access.
const auth = requirePermission("solutions");

router.use(auth);

router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.post("/reorder", ctrl.reorder);
router.get("/:slug", ctrl.getOne);
router.patch("/:slug", ctrl.update);
router.delete("/:slug", ctrl.remove);

module.exports = router;
