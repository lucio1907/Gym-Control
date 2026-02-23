import { Router } from "express";
import { getSettings, updateSettings } from "../../controllers/settings.controller";
import checkSession from "../../middlewares/checkSession.middleware";
import checkAdminSession from "../../middlewares/checkAdminSession.middleware";

const router = Router();

router.get("/", checkSession, checkAdminSession, getSettings);
router.put("/", checkSession, checkAdminSession, updateSettings);

export default router;
