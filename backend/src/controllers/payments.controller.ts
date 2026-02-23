import { NextFunction, Request, Response } from "express";
import paymentService from "../services/payments/Payment.service";

export const createPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payment = await paymentService.registerPayment(req.body);
        return res.status(201).json({ message: "Payment registered successfully", data: payment, status: "Created" });
    } catch (error) {
        next(error);
    }
};

export const getPaymentHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profileId = (req as any).user.rol === 'admin' ? req.query.profileId as string : (req as any).user.id;
        const history = await paymentService.getHistory(profileId);
        return res.json({ message: "Payment history info", data: history, status: "OK" });
    } catch (error) {
        next(error);
    }
};
