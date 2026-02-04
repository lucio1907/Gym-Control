import { Router } from "express";
import checkSession from "../../middlewares/checkSession.middleware";
import { checkIn } from "../../controllers/attendance.controller";

const router = Router();

router.post('/check-in/:method', checkSession, checkIn);

export default router;