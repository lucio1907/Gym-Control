import { NextFunction, Request, Response } from "express";
import registerProfileService from "../services/profile/RegisterProfile.service";
import loginProfileService from "../services/profile/LoginProfile.service";
import forgotPasswordService from "../services/profile/ForgotPassword.service";
import resetPasswordService from "../services/profile/ResetPassword.service";
import getProfileService from "../services/profile/GetProfile.service";
import updateProfileService from "../services/profile/UpdateProfile.service";
import deleteProfileService from "../services/profile/DeleteProfile.service";
import changePasswordService from "../services/profile/ChangePassword.service";

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
            sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
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
            sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict'
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

export const getProfileById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const profile = await getProfileService.getById(id);
        return res.json({ message: "Profile info", data: profile, status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const requestingUser = (req as any).user;

        // A user can only update their own profile unless they are an admin
        if (requestingUser.id !== id && requestingUser.rol !== "admin") {
            return res.status(403).json({ message: "No tenés permiso para modificar este perfil.", status: "Forbidden" });
        }

        const updatedProfile = await updateProfileService.update(id, req.body);
        return res.json({ message: "Profile updated successfully", data: updatedProfile, status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const deleteProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        await deleteProfileService.delete(id);
        return res.json({ message: "Profile deleted successfully", status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = (req as any).user.id;
        await changePasswordService.changePassword(id, req.body);
        return res.json({ message: "Password updated successfully", status: "OK" });
    } catch (error) {
        next(error);
    }
};