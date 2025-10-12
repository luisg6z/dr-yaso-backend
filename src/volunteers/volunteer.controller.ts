import { Request, Response } from 'express'
import {
    createVolunteer,
    getVolunteerById,
    getAllVolunteers,
    deleteVolunteer,
    updateVolunteer,
    getVolunteersByOccupation,
    getAllVolunteersForFranchise,
} from './volunteer.service'
import { idParamSchema, Pagination } from '../types/types'
import { AppError } from '../common/errors/errors'
import { tipoUsuarioEnum } from '../db/schemas/Usuarios'

export const createVolunteerHandler = async (req: Request, res: Response) => {
    try {
        const Volunteer = req.body
        res.status(201).json({
            data: await createVolunteer(Volunteer),
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
                message: 'Error creating Volunteer',
                details: error,
            })
        }
    }
}

export const getAllVolunteersHandler = async (_req: Request, res: Response) => {
    try {
        const pagination: Pagination = {
            page: +(_req.query.page || 1),
            limit: +(_req.query.limit || 10),
        }

        if (res.locals.user.role !== tipoUsuarioEnum.enumValues[0]) {
            res.status(200).json(
                await getAllVolunteersForFranchise(res.locals.user.franchiseId),
            )
        }

        res.status(200).json(await getAllVolunteers(pagination))
    } catch (error) {
        if (!res.headersSent) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    message: error.message,
                    details: error.details,
                })
            }
            res.status(500).json({
                message: 'Error retrieving Volunteers',
                details: error,
            })
        }
    }
}

export const getVolunteerByIdHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const parseId = idParamSchema.parse(+id)
        res.status(200).json({
            data: await getVolunteerById(parseId),
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
                message: 'Error retrieving Volunteer',
                details: error,
            })
        }
    }
}

export const updateVolunteerHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const Volunteer = req.body
        const parseId = idParamSchema.parse(+id)

        res.status(200).json({
            data: await updateVolunteer(parseId, Volunteer),
        })
    } catch (error: any) {
        if (!res.headersSent) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    message: error.message,
                    details: error.details,
                })
            }
            console.error(error)
            res.status(500).json({
                message: 'Error updating Volunteer',
                details: error.message,
            })
        }
    }
}

export const deleteVolunteerHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const parseId = idParamSchema.parse(+id)
        res.status(200).json({
            data: await deleteVolunteer(parseId),
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
                message: 'Error deleting Volunteer',
                details: error,
            })
        }
    }
}

export const getVolunteersByOccupationHandler = async (
    req: Request,
    res: Response,
) => {
    try {
        const { id } = req.params
        const parseId = idParamSchema.parse(+id)
        res.status(200).json(await getVolunteersByOccupation(parseId))
    } catch (error) {
        if (!res.headersSent) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    message: error.message,
                    details: error.details,
                })
            }
            res.status(500).json({
                message: 'Error al obtener voluntarios por cargo',
                details: error,
            })
        }
    }
}
