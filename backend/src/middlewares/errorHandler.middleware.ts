import { NextFunction, Request, Response } from "express";
import NotFoundException from "../errors/NotFoundException";
import BadRequestException from "../errors/BadRequestException";
import InternalServerError from "../errors/InternalServerError";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Error detected:", err);

    if (err instanceof NotFoundException) {
        return res.status(404).json({ message: err.message, status: "Not Found" });
    }
    
    if (err instanceof BadRequestException) {
        return res.status(400).json({ message: err.message, status: "Bad Request" });
    }
    
    if (err instanceof InternalServerError) {
        return res.status(500).json({ message: err.message, status: "Internal Server Error" });
    }

    // Default error
    return res.status(500).json({ 
        message: err.message || "Something went wrong", 
        status: "Error",
        error: process.env.NODE_ENV === "development" ? err : undefined
    });
};

export default errorHandler;