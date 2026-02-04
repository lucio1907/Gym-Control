import { NextFunction, Request, Response } from "express";
import attendanceService from "../services/attendance/attendance.service";

export const checkIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { qrToken } = req.body;
        const profileId = (req as any).user.id;
        const method = req.params.method as "QR_SCAN" | "MANUAL";

        const result = await attendanceService.registerEntry(qrToken, profileId, method);

        return res.json({ message: "Check in succesfully!", data: result, status: "OK" })
    } catch (error) {
        next(error);        
    }
};