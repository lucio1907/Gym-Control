import { Router } from "express";
import { deleteProfile, forgotPassword, getAllProfiles, getMe, loginProfile, logoutProfile, registerProfile, resetPassword, updateProfile, getProfileById, changePassword } from "../../controllers/profiles.controller";
import { ForgotPasswordSchema, LoginSchema, RegisterSchema, ResetPasswordSchema } from "../../validators/validators";
import validatorMiddleware from "../../middlewares/validatorsMiddleware.middleware";
import checkSession from "../../middlewares/checkSession.middleware";
import checkAdminSession from "../../middlewares/checkAdminSession.middleware";

const router = Router();

router.post("/register", validatorMiddleware(RegisterSchema), registerProfile);
router.post("/login", validatorMiddleware(LoginSchema), loginProfile);
router.post("/logout", checkSession, logoutProfile);

router.put("/change-password", checkSession, changePassword);

router.post("/forgot-password", validatorMiddleware(ForgotPasswordSchema), forgotPassword);
router.post("/reset-password", validatorMiddleware(ResetPasswordSchema), resetPassword);

router.get("/me", checkSession, getMe);
router.get("/", checkSession, checkAdminSession, getAllProfiles);
router.get("/:id", checkSession, checkAdminSession, getProfileById);
router.put("/:id", checkSession, checkAdminSession, updateProfile);
router.delete("/:id", checkSession, checkAdminSession, deleteProfile);

export default router;