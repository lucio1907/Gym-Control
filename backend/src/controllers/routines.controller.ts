import { NextFunction, Request, Response } from "express";
import createRoutineService from "../services/routines/CreateRoutine.service";
import deleteRoutineService from "../services/routines/DeleteRoutine.service";
import updateRoutineService from "../services/routines/UpdateRoutine.service";

export const createRoutine = async (req: Request, res: Response, next: NextFunction) => {
    const profile_id = req.params.profile_id as string;
    try {
        const newRoutine = await createRoutineService.create(req.body, profile_id);
        return res.status(201).json({ message: 'Routine created!', data: newRoutine, status: "Created" });
    } catch (error) {
        next(error);
    }
};

export const updateRoutine = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string
    try {
        const updatedRoutine = await updateRoutineService.update(id, req.body);
        return res.json({ message: "Routine updated", data: updatedRoutine, status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const deleteRoutine = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    try {
        await deleteRoutineService.delete(id);
        return res.json({ message: "Routine deleted!", routine_id: id, status: "OK" });
    } catch (error) {
        next(error);
    }
};