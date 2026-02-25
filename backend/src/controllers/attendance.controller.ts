import { NextFunction, Request, Response } from "express";
import attendanceService from "../services/attendance/attendance.service";
import BadRequestException from "../errors/BadRequestException";

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

export const monitorCheckIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token, dni, method } = req.body;
        const result = await attendanceService.monitorEntry({ token, dni, method });
        return res.json({ message: "¡Check-in exitoso!", data: result, status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const getProfileInfoForMonitor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!id) throw new BadRequestException("ID is required");
        
        const result = await attendanceService.getProfileInfoForMonitor(id as string);
        return res.json({ message: "Profile info", data: result, status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const getAttendanceHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profileId = (req as any).user.rol === 'admin' ? String(req.query.profileId) : (req as any).user.id;
        const history = await attendanceService.getHistory(profileId);
        return res.json({ message: "Attendance history info", data: history, status: "OK" });
    } catch (error) {
        next(error);
    }
};