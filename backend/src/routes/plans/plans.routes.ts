import { Router } from "express";
import checkAdminSession from "../../middlewares/checkAdminSession.middleware";
import checkSession from "../../middlewares/checkSession.middleware";
import { createPlan, getPlans, updatePlan, deletePlan } from "../../controllers/plans.controller";

const router = Router();

router.get("/", checkSession, checkAdminSession, getPlans);
router.post("/", checkSession, checkAdminSession, createPlan);
router.put("/:id", checkSession, checkAdminSession, updatePlan);
router.delete("/:id", checkSession, checkAdminSession, deletePlan);

export default router;
