const express = require("express");
const router = express.Router();
const { signup, login, me } = require("../controllers/authController");
const { requireAdmin } = require("../middleware/auth");

router.post("/signup", signup);   // guarded by x-signup-key header
router.post("/login", login);
router.get("/me", requireAdmin, me);

module.exports = router;
