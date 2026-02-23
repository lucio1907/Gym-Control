import { Router } from "express";
import checkSession from "../../middlewares/checkSession.middleware";
import { createRoutine, deleteRoutine, getRoutinesByProfile, updateRoutine, notifyStudent } from "../../controllers/routines.controller";
import checkAdminSession from "../../middlewares/checkAdminSession.middleware";

const router = Router();

router.get('/profile/:profile_id', checkSession, getRoutinesByProfile);

router.post('/createRoutine/:profile_id', checkSession, checkAdminSession, createRoutine);
router.post('/notify/:profile_id', checkSession, checkAdminSession, notifyStudent);

router.put("/updateRoutine/:id", checkSession, checkAdminSession, updateRoutine);

router.delete("/deleteRoutine/:id", checkSession, checkAdminSession, deleteRoutine);

export default router;