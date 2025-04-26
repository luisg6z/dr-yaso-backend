import { Request, Response } from "express";
import { createVisit, deleteVisit, getAllVisits, getAllVisitsForFranchise, getVisitById, updateVisit } from "./visits.service";
import { idParamSchema, Pagination } from "../types/types";
import { AppError } from "../common/errors/errors";
import { tipoUsuarioEnum } from "../db/schemas/Usuarios";


export const createVisitsHandler = async (req: Request, res: Response) => {
    try {
        res.status(201).json({
            items: await createVisit(req.body)
        } )
    } catch (error: any) {
        if (!res.headersSent) {
            if(error instanceof AppError) {
                res.status(error.statusCode).json({
                    message: error.message,
                    details: error.details,
                })
            }
            res.status(500).json({
                message: "Internal server error",
                details: error.message,
            })
        }
    }
}

export const getAllVisitsHandler = async (req: Request, res: Response) => {
    try {
        const pagination: Pagination = {
            page: +(req.query.page || 1),
            limit: +(req.query.limit || 10),
        }
        if(res.locals.user.role !== tipoUsuarioEnum.enumValues[0]) {
            res.status(200).json(await getAllVisitsForFranchise(pagination, res.locals.user.locationId))
        }
        res.status(200).json(await getAllVisits(pagination))
    } catch (error) {
        if (!res.headersSent) {
            if(error instanceof AppError) {
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

export const getVisitByIdHandler = async (req: Request, res: Response) => {
    try {
        const parsedId = idParamSchema.parse(+req.params.id);
        res.status(200).json({
            items: await getVisitById(parsedId)
        })
    } catch (error) {
        if (!res.headersSent) {
            if(error instanceof AppError) {
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

export const updateVisitHandler = async (req: Request, res: Response) => {
    try {
        const parsedId = idParamSchema.parse(+req.params.id);
        res.status(200).json({
            items: await updateVisit(parsedId, req.body)
        })
    } catch (error) {
        if (!res.headersSent) {
            if(error instanceof AppError) {
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

export const deleteVisitHandler = async (req: Request, res: Response) => {
    try {
        const parsedId = idParamSchema.parse(+req.params.id);
        res.status(200).json({
            items: await deleteVisit(parsedId)
        })
    } catch (error) {
        if (!res.headersSent) {
            if(error instanceof AppError) {
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