import { Request, Response } from 'express'
import {
    createAccountMovement,
    getAllAccountMovements,
    getAccountMovementById,
} from './account-movements.service'
import { AppError } from '../common/errors/errors'
import { Pagination } from '../types/types'
import { db } from '../db/db'
import { CuentasBancarias } from '../db/schemas/CuentasBancarias'
import { eq } from 'drizzle-orm'

export const createAccountMovementHandler = async (req: Request, res: Response) => {
    try {
        const movement = req.body
        const user = res.locals.user

        // Check verification: Ensure user has access to the account
        if (user.role === 'Coordinador') {
            const account = await db
                .select({ franchiseId: CuentasBancarias.idFranquicia })
                .from(CuentasBancarias)
                .where(eq(CuentasBancarias.id, movement.accountId))
                .then(rows => rows[0])

            if (!account) {
                throw new AppError(404, 'Bank Account not found')
            }

            if (account.franchiseId !== user.franchiseId) {
                throw new AppError(403, 'Unauthorized access to this franchise data')
            }
        }

        res.status(201).json({
            data: await createAccountMovement(movement),
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
            message: 'Error creating Account Movement',
            details: error,
        })
    }
}

export const getAllAccountMovementsHandler = async (req: Request, res: Response) => {
    try {
        const pagination: Pagination = {
            page: +(req.query.page || 1),
            limit: +(req.query.limit || 10),
        }

        const user = res.locals.user
        let franchiseId: number | undefined = undefined
        if (user.role === 'Coordinador') {
            franchiseId = user.franchiseId
        }

        res.status(200).json(await getAllAccountMovements(pagination, franchiseId))
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                details: error.details,
            })
            return
        }
        res.status(500).json({
            message: 'Error retrieving Account Movements',
            details: error,
        })
    }
}

export const getAccountMovementByIdHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const user = res.locals.user

        const movement = await getAccountMovementById(+id)

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
            message: 'Error retrieving Account Movement',
            details: error,
        })
    }
}
