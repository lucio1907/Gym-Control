import { NextFunction, Request, Response } from "express";
import adminService from "../services/admin/Admin.service";

export const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newAdmin = await adminService.create(req.body);
        return res.status(201).json({ message: 'New admin created!', data: newAdmin, status: 'Created' });
    } catch (error) {
        next(error);
    }
};

export const loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const admin = await adminService.login(req.body);

        res.cookie("access_token", admin?.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 7
        });

        return res.json({ message: "Admin logged in", data: admin, status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const updateAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedAdmin = await adminService.update(`${req.params.id}`, req.body);
        return res.json({ message: 'Admin updated!', data: updatedAdmin, status: 'OK' });
    } catch (error) {
        next(error);
    }
};

export const deleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminService.delete(`${req.params.id}`);
        return res.json({ message: 'Admin deleted!', status: 'OK' });
    } catch (error) {
        next(error);
    }
}

export const getAdmins = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const admin = await adminService.getAdmins();
        return res.json({ message: 'Admins info', data: admin, status: 'OK' })
    } catch (error) {
        next(error);
    }
}

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await adminService.getDashboardStats();
        return res.json({ message: 'Dashboard statistics', data: stats, status: 'OK' });
    } catch (error) {
        next(error);
    }
}