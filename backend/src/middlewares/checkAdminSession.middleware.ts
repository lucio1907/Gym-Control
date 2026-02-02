import { NextFunction, Request, Response } from "express";

const checkAdminSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;

        if (!user || user.rol !== "admin")
          return res
            .status(403)
            .json({
              message: "Access denied: Admins only",
              status: "Forbidden",
            });

        next();
    } catch (error) {
        return res
          .status(500)
          .json({
            message: "Error verifying permissions",
            status: "Internal Server Error",
          });
    }
};

export default checkAdminSession;