import { Router } from "express";
import checkSession from "../../middlewares/checkSession.middleware";
import checkAdminSession from "../../middlewares/checkAdminSession.middleware";
import { createPayment, getPaymentHistory } from "../../controllers/payments.controller";

const router = Router();

router.post("/", checkSession, checkAdminSession, createPayment);
router.get("/history", checkSession, getPaymentHistory);

export default router;
