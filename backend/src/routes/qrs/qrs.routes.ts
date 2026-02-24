import { Router } from "express";
import { generateTemporalQr, getEntranceQr } from "../../controllers/qrs.controller";
import checkSession from "../../middlewares/checkSession.middleware";

const router = Router();

router.get("/generate-qr", checkSession, generateTemporalQr);
router.get("/entrance-qr", getEntranceQr);

export default router;
