import { Router } from "express";
import { register, verify, login, requestPasswordReset, resetPassword } from "../../controllers/auth-controller";

const router = Router();

router.post("/register", register);
router.post("/verify", verify);
router.post("/login", login);
router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;
