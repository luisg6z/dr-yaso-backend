import { Request, Response } from 'express'
import {
    createUser,
    deleteUser,
    getAllUsers,
    getAllUsersForFranchise,
    getAllUsersForFranchiseNoSudo,
    getUserById,
    updateUser,
} from './users.service'
import { idParamSchema, Pagination } from '../types/types'
import { AppError } from '../common/errors/errors'
import { tipoUsuarioEnum } from '../db/schemas/Usuarios'

export const createUserHandler = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const user = await createUser(req.body, res.locals.user.role)
        res.status(201).json({
            data: user,
        })
        return
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
                message: 'Internal server error',
                details: error,
            })
        }
        return // Ensure all code paths return a value
    }
}

export const getAllUsersHandler = async (req: Request, res: Response) => {
    try {
        const pagination: Pagination = {
            page: +(req.query.page || 1),
            limit: +(req.query.limit || 10),
        }

        const rawFranchiseId = req.query.franchiseId
        if (Array.isArray(rawFranchiseId)) {
            throw new AppError(
                400,
                'Invalid franchiseId',
                'franchiseId must be a single value',
            )
        }
        const role = res.locals.user.role as string | undefined

        if (role === tipoUsuarioEnum.enumValues[0]) {
            // Superusuario: por defecto ve todas las franquicias.
            // Puede filtrar por `franchiseId` (número) o `all`.
            if (rawFranchiseId === undefined || rawFranchiseId === 'all') {
                res.status(200).json(await getAllUsers(pagination))
                return
            }

            const parsedFranchiseId = Number(rawFranchiseId)
            if (
                !Number.isInteger(parsedFranchiseId) ||
                parsedFranchiseId <= 0
            ) {
                throw new AppError(
                    400,
                    'Invalid franchiseId',
                    'franchiseId must be a positive integer or "all"',
                )
            }

            res.status(200).json(
                await getAllUsersForFranchise(pagination, parsedFranchiseId),
            )
            return
        }

        // No-superusuario (incluye Coordinador): restringido a su franquicia.
        const tokenFranchiseId = res.locals.user.franchiseId as
            | number
            | null
            | undefined

        if (typeof tokenFranchiseId !== 'number' || tokenFranchiseId <= 0) {
            throw new AppError(
                400,
                'User franchiseId not found',
                'Authenticated user must have a franchiseId to list users',
            )
        }

        res.status(200).json(
            await getAllUsersForFranchiseNoSudo(pagination, tokenFranchiseId),
        )
        return
    } catch (error) {
        if (!res.headersSent) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    message: error.message,
                    details: error.details,
                })
                return
            }
            res.status(500).json({
                message: 'Internal server error',
                details: error,
            })
        }
    }
}

export const getUserByIdHandler = async (req: Request, res: Response) => {
    try {
        const parsedId = idParamSchema.parse(+req.params.id)
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
                message: 'Internal server error',
                details: error,
            })
        }
    }
}

export const updateUserHandler = async (req: Request, res: Response) => {
    try {
        const parsedId = idParamSchema.parse(+req.params.id)
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
                message: 'Internal server error',
                details: error,
            })
        }
    }
}

export const deleteUserHandler = async (req: Request, res: Response) => {
    try {
        const parsedId = idParamSchema.parse(+req.params.id)
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
                message: 'Internal server error',
                details: error,
            })
        }
    }
}
