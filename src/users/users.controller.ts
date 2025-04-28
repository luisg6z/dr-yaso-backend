import { Request, Response } from "express";
import { createUser, deleteUser, getAllUsers, getAllUsersNoSudo, getUserById, updateUser } from "./users.service";
import { idParamSchema, Pagination } from "../types/types";
import { AppError } from "../common/errors/errors";
import { tipoUsuarioEnum } from "../db/schemas/Usuarios";


export const createUserHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await createUser(req.body, res.locals.user.role)
        res.status(201).json({
            data: user
        })
        return;
    } catch (error) {
        if (!res.headersSent) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    statusCode: error.statusCode,
                    message: error.message,
                    details: error.details,
                })
            }
            res.status(500).json({
                message: "Internal server error",
                details: error,
            })
        }
        return; // Ensure all code paths return a value
    }
}

export const getAllUsersHandler = async (req: Request, res: Response) => {
    try {
        const pagination: Pagination = {
            page: +(req.query.page || 1),
            limit: +(req.query.limit || 10),
        }

        if(res.locals.user.role !== tipoUsuarioEnum.enumValues[0]) {
            res.status(200).json(await getAllUsersNoSudo(pagination))
        }

        res.status(200).json(await getAllUsers(pagination))
    } catch (error) {
        if (!res.headersSent) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    message: error.message,
                    details: error.details,
                })
            }
            res.status(500).json({
                message: "Internal server error",
                details: error,
            })
        }
    }
}

export const getUserByIdHandler = async (req: Request, res: Response) => {
    try {
        const parsedId = idParamSchema.parse(+req.params.id);
        res.status(200).json({
            data: await getUserById(parsedId),
        })
    } catch (error) {
        if (!res.headersSent) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    message: error.message,
                    details: error.details,
                })
            }
            res.status(500).json({
                message: "Internal server error",
                details: error,
            })
        }
    }
}

export const updateUserHandler = async (req: Request, res: Response) => {
    try {
        const parsedId = idParamSchema.parse(+req.params.id);
        res.status(200).json({
            data: await updateUser(parsedId, req.body),
        })
    } catch (error) {
        if (!res.headersSent) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    message: error.message,
                    details: error.details,
                })
            }
            res.status(500).json({
                message: "Internal server error",
                details: error,
            })
        }
    }
}

export const deleteUserHandler = async (req: Request, res: Response) => {
    try {
        const parsedId = idParamSchema.parse(+req.params.id);
        res.status(200).json({
            data: await deleteUser(parsedId),
        })
    } catch (error) {
        if (!res.headersSent) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    message: error.message,
                    details: error.details,
                })
            }
            res.status(500).json({
                message: "Internal server error",
                details: error,
            })
        }
    }
}

