import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";

const validatorMiddleware =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError)
        return res.status(400).json({
          status: "Error",
          errors: error.issues.map((e) => ({
            field: e.path[0],
            message: e.message,
          })),
        });
      next(error);
    }
  };

export default validatorMiddleware;
