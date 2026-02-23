import { NextFunction, Request, Response } from "express";
import registerProfileService from "../services/profile/RegisterProfile.service";
import loginProfileService from "../services/profile/LoginProfile.service";
import forgotPasswordService from "../services/profile/ForgotPassword.service";
import resetPasswordService from "../services/profile/ResetPassword.service";
import getProfileService from "../services/profile/GetProfile.service";

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

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await forgotPasswordService.forgotPassword(req.body.email);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await resetPasswordService.resetPassword(req.body);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const profile = await getProfileService.getMe(userId);
        return res.json({ message: "User profile info", data: profile, status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const logoutProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie("access_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict'
        });
        return res.json({ message: "Logged out successfully", status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const getAllProfiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profiles = await getProfileService.getAll();
        return res.json({ message: "All profiles info", data: profiles, status: "OK" });
    } catch (error) {
        next(error);
    }
};