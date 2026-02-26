import { Router } from "express";
import checkSession from "../../middlewares/checkSession.middleware";
import { createRoutine, deleteRoutine, getRoutinesByProfile, updateRoutine, notifyStudent } from "../../controllers/routines.controller";
import checkTeacherSession from "../../middlewares/checkTeacherSession.middleware";

const router = Router();

router.get('/profile/:profile_id', checkSession, getRoutinesByProfile);

router.post('/createRoutine/:profile_id', checkSession, checkTeacherSession, createRoutine);
router.post('/notify/:profile_id', checkSession, checkTeacherSession, notifyStudent);

router.put("/updateRoutine/:id", checkSession, checkTeacherSession, updateRoutine);

router.delete("/deleteRoutine/:id", checkSession, checkTeacherSession, deleteRoutine);

export default router;