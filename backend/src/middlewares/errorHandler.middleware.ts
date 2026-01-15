import { NextFunction, Request, Response } from "express";
import NotFoundException from "../errors/NotFoundException";
import BadRequestException from "../errors/BadRequestException";
import InternalServerError from "../errors/InternalServerError";

const errorHandler = async (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof NotFoundException) res.status(404).json({ message: err.message })
    if (err instanceof BadRequestException) res.status(404).json({ message: err.message })
    if (err instanceof InternalServerError) res.status(500).json({ message: err.message })
};