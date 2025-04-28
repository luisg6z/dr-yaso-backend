import { Request, Response } from "express";
import { createFranchise, deleteFranchise, getActiveFranchises, getFranchiseById, updateFranchise, getAllFranchises, getUserFranchise } from "./franchises.service";
import { idParamSchema, Pagination } from "../types/types";
import { AppError } from "../common/errors/errors";
import { tipoUsuarioEnum } from "../db/schemas/Usuarios";


export const createFranchiseHandler = async (req: Request, res: Response) => {
    try {
        const franchise = req.body;
        res.status(201).json({
            data: await createFranchise(franchise)
        })
    } catch (error) {
        if (!res.headersSent) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    message: error.message,
                    details: error.details,
                });
            }
            res.status(500).json({
                message: "Error creating franchise",
                details: error,
            });
        }
    }
}

export const getAllFranchisesHandler = async (req: Request, res: Response) => {
    try {
        const pagination: Pagination = {
            page: +(req.query.page || 1),
            limit: +(req.query.limit || 10),
        }
        if(res.locals.user.role !== tipoUsuarioEnum.enumValues[0]){
            const franchise = await getUserFranchise(res.locals.user.franchiseId)
            res.status(200).json(franchise)
        }
        const franchises = await getAllFranchises(pagination)
        res.status(200).json(franchises)
    } catch (error) {
        if (!res.headersSent) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    message: error.message,
                    details: error.details,
                });
            }
            res.status(500).json({
                message: "Error retreaving franchises",
                details: error,
            });
        }
    }
}

export const getActivesFranchisesHandler = async (req: Request, res: Response) => {
    try {
        const pagination: Pagination = {
            page: +(req.query.page || 1),
            limit: +(req.query.limit || 10),
        }
        res.status(200).json(await getActiveFranchises(pagination))
    } catch (error) {
        if (!res.headersSent) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    message: error.message,
                    details: error.details,
                });
            }
            res.status(500).json({
                message: "Error retreaving franchises",
                details: error,
            });
        }
    }
}

export const getFranchiseByIdHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const parsedId = idParamSchema.parse(+id);
        res.status(200).json({
            data: await getFranchiseById(parsedId),
        })
    } catch (error) {
        if (!res.headersSent) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    message: error.message,
                    details: error.details,
                });
            }
            res.status(500).json({
                message: "Error retreaving franchise",
                details: error,
            });
        }
    }
}

export const updateFranchiseHandler = async (req: Request, res: Response) => {
    try {
        const franchise = req.body;
        const parsedId = idParamSchema.parse(+req.params.id);
        res.status(200).json({
            data: await updateFranchise(parsedId, franchise),
        })
    } catch (error) {
        if (!res.headersSent) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    message: error.message,
                    details: error.details,
                });
            }
            res.status(500).json({
                message: "Error updating franchise",
                details: error,
            });
        }
    }
}

export const deleteFranchiseHandler = async (req: Request, res: Response) => {
    try {
        const parsedId = idParamSchema.parse(+req.params.id);
        res.status(200).json({
            data: await deleteFranchise(parsedId),
        })
    } catch (error) {
        if (!res.headersSent) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    message: error.message,
                    details: error.details,
                });
            }
            res.status(500).json({
                message: "Error deleting franchise",
                details: error,
            });
        }
    }
}