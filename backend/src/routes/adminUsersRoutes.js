const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/adminUsersController");
const { requireSuperAdmin } = require("../middleware/auth");

// Super Admin only: create dashboard accounts and assign their access.
router.use(requireSuperAdmin);

router.get("/meta", ctrl.meta); // must precede "/:id"
router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.patch("/:id", ctrl.update);
router.post("/:id/reset-2fa", ctrl.resetTwoFactor); // lost phone → set up again next sign-in
router.delete("/:id", ctrl.remove);

module.exports = router;
