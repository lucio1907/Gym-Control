import { NextFunction, Request, Response } from "express";
import createAdminService from "../services/admin/CreateAdmin.service";
import loginAdminService from "../services/admin/LoginAdmin.service";
import updateAdminService from "../services/admin/UpdateAdmin.service";
import deleteAdminService from "../services/admin/DeleteAdmin.service";
import getAdminsService from "../services/admin/GetAdmins.service";

export const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newAdmin = await createAdminService.create(req.body);
        return res.status(201).json({ message: 'New admin created!', data: newAdmin, status: 'Created' });
    } catch (error) {
        next(error);
    }
};

export const loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const admin = await loginAdminService.login(req.body);
        return res.json({ message: "Admin logged in", data: admin, status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const updateAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedAdmin = await updateAdminService.update(`${req.params.id}`, req.body);
        return res.json({ message: 'Admin updated!', data: updatedAdmin, status: 'OK' });
    } catch (error) {
        next(error);
    }
};

export const deleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await deleteAdminService.delete(`${req.params.id}`);
        return res.json({ message: 'Admin deleted!', status: 'OK' });
    } catch (error) {
        next(error);
    }
}

export const getAdmins = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const admin = await getAdminsService.get();
        return res.json({ message: 'Admins info', data: admin, status: 'OK' })
    } catch (error) {
        next(error);
    }
}