import { Router } from "express";
import { loginProfile, registerProfile } from "../../controllers/profiles.controller";

const router = Router();

router.post("/register", registerProfile);
router.post("/login", loginProfile);

export default router;