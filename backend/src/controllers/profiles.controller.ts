import { NextFunction, Request, Response } from "express";
import registerProfileService from "../services/profile/RegisterProfile.service";

export const registerProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newProfile = await registerProfileService.register(req.body);
        return res.status(201).json({ message: 'User created successfully', user: newProfile.user, status: "Created" })
    } catch (error) {
        next(error);
    }
};