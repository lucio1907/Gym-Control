import { Router } from "express";
import { generateTemporalQr } from "../../controllers/qrs.controller";

const router = Router();

router.get("/generate-qr", generateTemporalQr);

export default router;
