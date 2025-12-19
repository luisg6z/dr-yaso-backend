import { Request, Response } from 'express'
import {
    createCashMovement,
    getAllCashMovements,
    getCashMovementById,
} from './cash-movements.service'
import { AppError } from '../common/errors/errors'
import { Pagination } from '../types/types'
import { db } from '../db/db'
import { CajasChicas } from '../db/schemas/CajasChicas'
import { eq } from 'drizzle-orm'

export const createCashMovementHandler = async (req: Request, res: Response) => {
    try {
        const movement = req.body
        const user = res.locals.user

        // Check verification: Ensure user has access to the petty cash franchise
        if (user.role === 'Coordinador') {
            const pettyCash = await db
                .select({ franchiseId: CajasChicas.idFranquicia })
                .from(CajasChicas)
                .where(eq(CajasChicas.id, movement.pettyCashId))
                .then(rows => rows[0])

            if (!pettyCash) {
                throw new AppError(404, 'Petty Cash not found')
            }

            if (pettyCash.franchiseId !== user.franchiseId) {
                throw new AppError(403, 'Unauthorized access to this franchise data')
            }
        }

        res.status(201).json({
            data: await createCashMovement(movement),
        })
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                details: error.details,
            })
            return
        }
        res.status(500).json({
            message: 'Error creating Cash Movement',
            details: error,
        })
    }
}

export const getAllCashMovementsHandler = async (req: Request, res: Response) => {
    try {
        const pagination: Pagination = {
            page: +(req.query.page || 1),
            limit: +(req.query.limit || 10),
            status: (req.query.status as any) || 'active',
        }

        const user = res.locals.user
        let franchiseId: number | undefined = undefined
        if (user.role === 'Coordinador') {
            franchiseId = user.franchiseId
        }

        res.status(200).json(await getAllCashMovements(pagination, franchiseId))
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                details: error.details,
            })
            return
        }
        res.status(500).json({
            message: 'Error retrieving Cash Movements',
            details: error,
        })
    }
}

export const getCashMovementByIdHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const user = res.locals.user

        const movement = await getCashMovementById(+id)

        if (user.role === 'Coordinador' && movement.franchiseId !== user.franchiseId) {
            throw new AppError(403, 'Unauthorized access to this franchise data')
        }

        res.status(200).json({
            data: movement,
        })
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                details: error.details,
            })
            return
        }
        res.status(500).json({
            message: 'Error retrieving Cash Movement',
            details: error,
        })
    }
}
