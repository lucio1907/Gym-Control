import { Router } from "express";
import checkSession from "../../middlewares/checkSession.middleware";
import { createRoutine, deleteRoutine, updateRoutine } from "../../controllers/routines.controller";
import checkAdminSession from "../../middlewares/checkAdminSession.middleware";

const router = Router();

router.post('/createRoutine/:profile_id', checkSession, createRoutine);

router.put("/updateRoutine/:id", checkSession, checkAdminSession, updateRoutine);

router.delete("/deleteRoutine/:id", checkSession, checkAdminSession, deleteRoutine);

export default router;