import { Request, Response } from 'express'
import {
    createOccupation,
    deleteOccupation,
    getAllOccupations,
    getOccupationById,
    updateOccupation,
} from './occupations.service'
import { idParamSchema, Pagination } from '../types/types'
import { AppError } from '../common/errors/errors'

export const createOccupationHandler = async (req: Request, res: Response) => {
    try {
        const Occupation = req.body
        res.status(201).json({
            data: await createOccupation(Occupation),
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
                message: 'Error creating ocupation',
                details: error,
            })
        }
    }
}

export const getAllOccupationsHandler = async (
    _req: Request,
    res: Response,
) => {
    try {
        const pagination: Pagination = {
            page: +(_req.query.page || 1),
            limit: +(_req.query.limit || 10),
        }

        res.status(200).json(await getAllOccupations(pagination))
    } catch (error) {
        if (!res.headersSent) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    message: error.message,
                    details: error.details,
                })
            }

            res.status(500).json({
                message: 'Error retrieving ocupations',
                details: error,
            })
        }
    }
}

export const getOccupationByIdHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const parseId = idParamSchema.parse(+id)
        res.status(200).json({
            data: await getOccupationById(parseId),
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
                message: 'Error retrieving ocupation',
                details: error,
            })
        }
    }
}

export const updateOccupationHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const occupation = req.body
        const parseId = idParamSchema.parse(+id)

        res.status(200).json({
            data: await updateOccupation(parseId, occupation),
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
                message: 'Error updating ocupation',
                details: error,
            })
        }
    }
}

export const deleteOccupationHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const parseId = idParamSchema.parse(+id)
        res.status(200).json({
            data: await deleteOccupation(parseId),
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
                message: 'Error deleting ocupation',
                details: error,
            })
        }
    }
}
