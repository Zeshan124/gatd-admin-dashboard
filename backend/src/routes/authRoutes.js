const express = require("express");
const router = express.Router();
const { signup, login, me, changePassword } = require("../controllers/authController");
const twoFactor = require("../controllers/twoFactorController");
const { requireAdmin } = require("../middleware/auth");
const { createRateLimit } = require("../middleware/rateLimit");

// Per-IP limits on the sign-in steps (on top of the per-account limit on wrong
// 2FA codes inside twoFactorController).
const loginRateLimit = createRateLimit([{ ms: 10 * 60 * 1000, max: 20 }]);
const twoFactorRateLimit = createRateLimit([{ ms: 10 * 60 * 1000, max: 30 }]);

router.post("/signup", signup); // disabled — accounts are created by a Super Admin
router.post("/login", loginRateLimit, login); // step 1: password → 2FA challenge

// Step 2: two-factor authentication (Google Authenticator), using the challenge token.
router.post("/2fa/setup", twoFactorRateLimit, twoFactor.setup);   // first time: QR code
router.post("/2fa/enable", twoFactorRateLimit, twoFactor.enable); // confirm first code → logged in
router.post("/2fa/verify", twoFactorRateLimit, twoFactor.verify); // every later login

router.get("/me", requireAdmin, me);
router.patch("/password", requireAdmin, changePassword); // change own password

module.exports = router;
