import { Router } from "express";
import checkSession from "../../middlewares/checkSession.middleware";
import { checkIn, getAttendanceHistory, monitorCheckIn } from "../../controllers/attendance.controller";

const router = Router();

router.post('/check-in/:method', checkSession, checkIn);
router.post('/monitor-check-in', monitorCheckIn); // Public route for gym monitor device
router.get('/history', checkSession, getAttendanceHistory);

export default router;