import { NextFunction, Request, Response } from "express";


export const authorize = (roles: string[]) => 
    (_req: Request, res: Response, next: NextFunction): void => {
        const userRole = res.locals.user.role;

        if (!roles.includes(userRole)) {
            res.status(403).json({
                statusCode: 403,
                message: "You are not authorized to access this resource",
                details: `User role ${userRole} is not allowed to access this resource`, 
            });
        }

        next();
    };
