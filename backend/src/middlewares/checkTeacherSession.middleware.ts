import { NextFunction, Request, Response } from "express";

const checkTeacherSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;

        // Admins and Teachers are allowed
        if (!user || (user.rol !== "teacher" && user.rol !== "admin"))
          return res
            .status(403)
            .json({
              message: "Access denied: Teachers and Admins only",
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

export default checkTeacherSession;
