import { NextFunction, Request, Response } from "express";
import generateQRService from "../services/qrs/GenerateQr.service";

export const generateTemporalQr = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profileId = (req as any).user.id;
        const temporalQr = await generateQRService.generateQr(profileId);
        return res.json({ message: "Temporal QR Generated", token: temporalQr.token, status: "OK" })
    } catch (error) {
        next(error);
        console.log(error)
    }
};

export const getEntranceQr = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const entranceQr = await generateQRService.generateEntranceQr();
        return res.json({ message: "Entrance QR Generated", token: entranceQr.token, status: "OK" })
    } catch (error) {
        next(error);
    }
};