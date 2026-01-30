import { NextFunction, Request, Response } from "express";
import generateQRService from "../services/qrs/GenerateQr.service";

export const generateTemporalQr = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const temporalQr = await generateQRService.generateQr();
        return res.json({ message: "Temporal QR Generated", token: temporalQr.token, status: "OK" })
    } catch (error) {
        next(error);
        console.log(error)
    }
};