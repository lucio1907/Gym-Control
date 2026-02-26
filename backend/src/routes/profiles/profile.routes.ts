import { Router } from "express";
import { deleteProfile, forgotPassword, getAllProfiles, getMe, loginProfile, logoutProfile, registerProfile, resetPassword, updateProfile, getProfileById, changePassword, getAssignedStudents, claimStudent, searchUnlinkedStudents, getTeacherStats } from "../../controllers/profiles.controller";
import { ForgotPasswordSchema, LoginSchema, RegisterSchema, ResetPasswordSchema } from "../../validators/validators";
import validatorMiddleware from "../../middlewares/validatorsMiddleware.middleware";
import checkSession from "../../middlewares/checkSession.middleware";
import checkAdminSession from "../../middlewares/checkAdminSession.middleware";
import checkTeacherSession from "../../middlewares/checkTeacherSession.middleware";

const router = Router();

router.post("/register", checkSession, checkAdminSession, validatorMiddleware(RegisterSchema), registerProfile);
router.post("/login", validatorMiddleware(LoginSchema), loginProfile);
router.post("/logout", checkSession, logoutProfile);

router.put("/change-password", checkSession, changePassword);

router.post("/forgot-password", validatorMiddleware(ForgotPasswordSchema), forgotPassword);
router.post("/reset-password", validatorMiddleware(ResetPasswordSchema), resetPassword);

router.get("/me", checkSession, getMe);
router.get("/teacher-stats", checkSession, checkTeacherSession, getTeacherStats);
router.get("/assigned-students", checkSession, checkTeacherSession, getAssignedStudents);
router.get("/search-students", checkSession, checkTeacherSession, searchUnlinkedStudents);
router.put("/claim-student", checkSession, checkTeacherSession, claimStudent);
router.get("/", checkSession, checkAdminSession, getAllProfiles);
router.get("/:id", checkSession, checkTeacherSession, getProfileById);
router.put("/:id", checkSession, updateProfile);
router.delete("/:id", checkSession, checkAdminSession, deleteProfile);

export default router;