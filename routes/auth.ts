import express = require("express");

const { register, verify, login, requestPasswordReset, resetPassword } = require("../controllers/auth-controller");

const router = express.Router();

router.post("/register", register);
router.post("/verify", verify);
router.post("/login", login);
router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

module.exports = router;