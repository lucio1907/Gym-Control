import { Router } from "express";
import checkSession from "../../middlewares/checkSession.middleware";
import { checkIn, getAttendanceHistory } from "../../controllers/attendance.controller";

const router = Router();

router.post('/check-in/:method', checkSession, checkIn);
router.get('/history', checkSession, getAttendanceHistory);

export default router;