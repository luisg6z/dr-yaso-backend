import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";


export const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            ...req.body
        })
        next()
    } catch (error: any) {
        res.status(400).json({
            message: "Validation error",
            details: error.errors,
        })
    }
}