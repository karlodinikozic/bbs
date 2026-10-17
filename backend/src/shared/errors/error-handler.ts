import {ErrorRequestHandler, RequestHandler} from "express";
import {ZodError} from "zod";
import {AppError} from "./app-errors";
import {isUniqueConstraintError} from "../database/prisma-errors";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ZodError) {
         res.status(400).json({
            error: "Validation failed.",
            details: err.issues.map(i => ({field: i.path.join("."), message: i.message}))
        })
        return
    }
    if(err instanceof AppError) {
         res.status(err.statusCode).json({error: err.message});
        return;
    }
    if(isUniqueConstraintError(err)) {
         res.status(409).json({error: "Name already exists in this folder"});
        return;
    }

    console.log(err)
     res.status(500).json({error: "Internal server error"});
}

export const notFoundHandler: RequestHandler = (_req,res) => {
    return res.status(404).json({error: "Route not Found"});
}