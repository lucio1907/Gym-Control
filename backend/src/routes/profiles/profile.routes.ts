import { Router } from "express";
import { registerProfile } from "../../controllers/profiles.controller";

const router = Router();

router.post("/register", registerProfile);

export default router;