import { NextFunction, Request, Response } from "express";
import registerProfileService from "../services/profile/RegisterProfile.service";
import loginProfileService from "../services/profile/LoginProfile.service";

export const registerProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newProfile = await registerProfileService.register(req.body);
        return res.status(201).json({ message: 'User created successfully', user: newProfile.user, status: "Created" })
    } catch (error) {
        next(error);
    }
};

export const loginProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = await loginProfileService.login(req.body);

        res.cookie("access_token", authUser?.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 7
        })

        return res.json({ message: 'User logged in', token: authUser?.access_token, user: authUser?.user, status: "OK" })
    } catch (error) {
        next(error);
    }
};