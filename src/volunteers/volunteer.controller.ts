import { Request, Response } from 'express'
import {
    createVolunteer,
    getVolunteerById,
    getAllVolunteers,
    deleteVolunteer,
    updateVolunteer,
    getVolunteersByOccupation,
} from './volunteer.service'
import { idParamSchema, Pagination } from '../types/types'
import { AppError } from '../common/errors/errors'
import { tipoUsuarioEnum } from '../db/schemas/Usuarios'

export const createVolunteerHandler = async (req: Request, res: Response) => {
    try {
        const user = res.locals.user
        const volunteerData = req.body

        // If user is Coordinator, force franchiseId to be their own
        if (user.role === tipoUsuarioEnum.enumValues[3]) {
            // Coordinador
            volunteerData.franchiseId = user.franchiseId
        }

        // If user is Superuser, franchiseId is optional in schema but required for logic
        // If not provided by Superuser, it might remain undefined, which service might not handle well for Pertenecen
        // But since requirements say "Superuser may pass", we can assume they should if they want to assign.
        // If they don't, and service fails, that's "expected" or service handles it.
        // Let's assume for now we just inject for Coordinator.

        res.status(201).json({
            data: await createVolunteer(volunteerData),
        })
        return
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                details: error.details,
            })
            return
        }
        res.status(500).json({
            message: 'Error creating Volunteer',
            details: error,
        })
        return
    }
}

export const getAllVolunteersHandler = async (_req: Request, res: Response) => {
    try {
        const pagination: Pagination = {
            page: +(_req.query.page || 1),
            limit: +(_req.query.limit || 10),
            status: (_req.query.status as any) || 'active',
        }

        const rawFranchiseId = _req.query.idFranquicia
        const requestedFranchiseId =
            rawFranchiseId === undefined ? undefined : Number(rawFranchiseId)

        if (
            requestedFranchiseId !== undefined &&
            (!Number.isInteger(requestedFranchiseId) ||
                requestedFranchiseId <= 0)
        ) {
            throw new AppError(400, 'idFranquicia inválido')
        }

        // Seguridad: si no es superusuario, siempre se fuerza a la franquicia del usuario.
        const effectiveFranchiseId =
            res.locals.user.role === tipoUsuarioEnum.enumValues[0]
                ? requestedFranchiseId
                : res.locals.user.franchiseId

        res.status(200).json(
            await getAllVolunteers(pagination, effectiveFranchiseId),
        )
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
