import { Request, Response, NextFunction } from "express";
import settingsService from "../services/settings/Settings.service";

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const settings = await settingsService.getSettings();
        return res.json({ message: "Global settings retrieved", data: settings, status: "OK" });
    } catch (error) {
        next(error);
    }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedSettings = await settingsService.updateSettings(req.body);
        return res.json({ message: "Global settings updated", data: updatedSettings, status: "OK" });
    } catch (error) {
        next(error);
    }
};
