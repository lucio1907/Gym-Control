import { NextFunction, Request, Response } from "express";
import routineService from "../services/routines/Routine.service";

export const createRoutine = async (req: Request, res: Response, next: NextFunction) => {
    const profile_id = req.params.profile_id as string;
    try {
        const newRoutine = await routineService.create(req.body, profile_id);
        return res.status(201).json({ message: 'Routine created!', data: newRoutine, status: "Created" });
    } catch (error) {
        next(error);
    }
};

export const notifyStudent = async (req: Request, res: Response, next: NextFunction) => {
    const profile_id = req.params.profile_id as string;
    try {
        await routineService.notify(profile_id);
        return res.json({ message: "Student notified!", status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const updateRoutine = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string
    try {
        const updatedRoutine = await routineService.update(id, req.body);
        return res.json({ message: "Routine updated", data: updatedRoutine, status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const deleteRoutine = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    try {
        await routineService.delete(id);
        return res.json({ message: "Routine deleted!", routine_id: id, status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const getRoutinesByProfile = async (req: Request, res: Response, next: NextFunction) => {
    const profile_id = req.params.profile_id as string;
    try {
        const routines = await routineService.getByProfileId(profile_id);
        return res.json({ message: "Profile routines info", data: routines, status: "OK" });
    } catch (error) {
        next(error);
    }
};