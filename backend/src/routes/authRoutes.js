const express = require("express");
const router = express.Router();
const { signup, login, me, changePassword } = require("../controllers/authController");
const { requireAdmin } = require("../middleware/auth");

router.post("/signup", signup); // disabled — accounts are created by a Super Admin
router.post("/login", login);
router.get("/me", requireAdmin, me);
router.patch("/password", requireAdmin, changePassword); // change own password

module.exports = router;
