import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../../common/errors/errors";


export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            throw new AppError(401, "Token not provided", "Token is required for authentication");
        }
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in the environment variables");
        }
        if (typeof token !== "string") {
            throw new Error("Invalid token format");
        }
        const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
         res.locals.user = verifiedToken;
        return next();
    } catch (error) {
        res.status(401).json({
            statusCode: 401,
            message: "Unauthorized",
            details: error instanceof Error ? error.message : "Invalid token",
        });
    }
}