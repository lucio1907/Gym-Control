import { NextFunction, Request, Response } from "express";
import profileService from "../services/profile/Profile.service";

export const registerProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newProfile = await profileService.register(req.body);
        return res.status(201).json({ message: 'User created successfully', user: newProfile.user, status: "Created" })
    } catch (error) {
        next(error);
    }
};

export const loginProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = await profileService.login(req.body);

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
        const result = await profileService.forgotPassword(req.body.email);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await profileService.resetPassword(req.body.token, req.body.newPassword);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const profile = await profileService.getMe(userId);
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
        const profiles = await profileService.getAll();
        return res.json({ message: "All profiles info", data: profiles, status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const getProfileById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const profile = await profileService.getById(id);
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

        const updatedProfile = await profileService.update(id, req.body);
        return res.json({ message: "Profile updated successfully", data: updatedProfile, status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const deleteProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        await profileService.delete(id);
        return res.json({ message: "Profile deleted successfully", status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = (req as any).user.id;
        await profileService.changePassword(id, req.body);
        return res.json({ message: "Password updated successfully", status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const getAssignedStudents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const teacherId = (req as any).user.id;
        const students = await profileService.getAssignedStudents(teacherId);
        return res.json({ message: "Assigned students info", data: students, status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const claimStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const teacherId = (req as any).user.id;
        const { identifier } = req.body;
        
        if (!identifier) {
            return res.status(400).json({ message: "Identificador (Email o DNI) requerido", status: "Bad Request" });
        }

        const student = await profileService.claimStudent(teacherId, identifier);
        return res.json({ 
            message: "Alumno vinculado correctamente", 
            data: student, 
            status: "OK" 
        });
    } catch (error) {
        next(error);
    }
};

export const searchUnlinkedStudents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req.query;
        if (!query) return res.json({ data: [] });
        
        const students = await profileService.searchUnlinkedStudents(query as string);
        return res.json({ data: students, status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const getTeacherStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        const stats = await profileService.getTeacherStats(user.id);
        return res.json({ data: stats, status: "OK" });
    } catch (error) {
        next(error);
    }
};