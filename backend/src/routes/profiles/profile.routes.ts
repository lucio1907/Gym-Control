import { Router } from "express";
import { forgotPassword, loginProfile, registerProfile, resetPassword } from "../../controllers/profiles.controller";
import { ForgotPasswordSchema, LoginSchema, RegisterSchema, ResetPasswordSchema } from "../../validators/validators";
import validatorMiddleware from "../../middlewares/validatorsMiddleware.middleware";

const router = Router();

router.post("/register", validatorMiddleware(RegisterSchema), registerProfile);
router.post("/login", validatorMiddleware(LoginSchema), loginProfile);

router.post("/forgot-password", validatorMiddleware(ForgotPasswordSchema), forgotPassword);
router.post("/reset-password", validatorMiddleware(ResetPasswordSchema), resetPassword);

export default router;