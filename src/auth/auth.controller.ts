import { Request, Response } from "express";
import { login } from "./auth.service";


export const loginHandler = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        res.status(200).json(await login(data))
    } catch (error) {
        res.status(401).json({
            message: "Error logging in",
            details: error,
        })
    }
}