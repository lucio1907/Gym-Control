import { NextFunction, Request, Response } from "express";
import planService from "../services/admin/Plan.service";

export const createPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const plan = await planService.create(req.body);
        return res.status(201).json({ message: "Plan created successully", data: plan, status: "Created" });
    } catch (error) {
        next(error);
    }
};

export const getPlans = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const plans = await planService.findAll();
        return res.json({ message: "Plans list", data: plans, status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const updatePlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const plan = await planService.update(`${req.params.id}`, req.body);
        return res.json({ message: "Plan updated successully", data: plan, status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const deletePlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await planService.delete(`${req.params.id}`);
        return res.json({ message: "Plan deleted successully", status: "OK" });
    } catch (error) {
        next(error);
    }
};
