import { Router } from "express";
import { loginProfile, registerProfile } from "../../controllers/profiles.controller";
import { LoginSchema, RegisterSchema } from "../../validators/validators";
import validatorMiddleware from "../../middlewares/validatorsMiddleware.middleware";

const router = Router();

router.post("/register", validatorMiddleware(RegisterSchema), registerProfile);
router.post("/login", validatorMiddleware(LoginSchema), loginProfile);

export default router;