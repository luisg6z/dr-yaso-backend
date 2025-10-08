import { Request, Response } from "express";
import { login } from "./auth.service";
import { AppError } from "../common/errors/errors";

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    console.log("Login data:", data);
    res.status(200).json(await login(data));
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        statusCode: error.statusCode,
        message: error.message,
        details: error.details,
      });
    }
  }
};
