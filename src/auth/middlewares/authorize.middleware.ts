import { NextFunction, Request, Response } from "express";


export const authorize = (roles: string[]) => 
    (_req: Request, res: Response, next: NextFunction): void => {
        const userRole = res.locals.user.type;

        if (!roles.includes(userRole)) {
            res.status(403).json({ message: "Forbidden" });
        }

        next();
    };
