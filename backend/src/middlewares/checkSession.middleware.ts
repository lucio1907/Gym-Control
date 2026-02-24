import { NextFunction, Request, Response } from "express";
import jwtManagement from "../utils/jwt.utils";


const checkSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.access_token;

        if (!token) return res.status(401).json({ message: 'Unauthorized', status: "Unauthorized" });

        const decoded = await jwtManagement.compareToken(token);

        (req as any).user = decoded
        next();
    } catch (error) {
        res.clearCookie("access_token")
        return res.status(500).json({ message: "Invalid Session", status: "Internal Server Error" })
    }
};

export default checkSession;