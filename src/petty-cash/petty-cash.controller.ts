import { Request, Response } from 'express'
import {
    createPettyCash,
    getAllPettyCash,
    getPettyCashById,
    updatePettyCash,
    deletePettyCash,
} from './petty-cash.service'
import { AppError } from '../common/errors/errors'
import { Pagination } from '../types/types'

export const createPettyCashHandler = async (req: Request, res: Response) => {
    try {
        const pettyCash = req.body
        const user = res.locals.user

        // Logic to verify if coordinator is creating for their own franchise
        if (
            user.role === 'Coordinador' &&
            pettyCash.franchiseId !== user.franchiseId
        ) {
            throw new AppError(
                403,
                'Coordinators can only create petty cash for their own franchise',
            )
        }

        res.status(201).json({
            data: await createPettyCash(pettyCash),
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
            message: 'Error creating Petty Cash',
            details: error,
        })
    }
}

export const getAllPettyCashHandler = async (req: Request, res: Response) => {
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

        res.status(200).json(await getAllPettyCash(pagination, franchiseId))
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                details: error.details,
            })
            return
        }
        res.status(500).json({
            message: 'Error retrieving Petty Cash',
            details: error,
        })
    }
}

export const getPettyCashByIdHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const user = res.locals.user

        const pettyCash = await getPettyCashById(+id)

        if (
            user.role === 'Coordinador' &&
            pettyCash.franchiseId !== user.franchiseId
        ) {
            throw new AppError(
                403,
                'Unauthorized access to this franchise data',
            )
        }

        res.status(200).json({
            data: pettyCash,
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
            message: 'Error retrieving Petty Cash',
            details: error,
        })
    }
}

export const updatePettyCashHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const pettyCashUpdate = req.body
        const user = res.locals.user

        // First fetch to check permission
        const existingPettyCash = await getPettyCashById(+id)
        if (
            user.role === 'Coordinador' &&
            existingPettyCash.franchiseId !== user.franchiseId
        ) {
            throw new AppError(
                403,
                'Unauthorized access to this franchise data',
            )
        }

        res.status(200).json({
            data: await updatePettyCash(+id, pettyCashUpdate),
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
            message: 'Error updating Petty Cash',
            details: error,
        })
    }
}

export const deletePettyCashHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const user = res.locals.user

        // First fetch to check permission
        const existingPettyCash = await getPettyCashById(+id)
        if (
            user.role === 'Coordinador' &&
            existingPettyCash.franchiseId !== user.franchiseId
        ) {
            throw new AppError(
                403,
                'Unauthorized access to this franchise data',
            )
        }

        res.status(200).json({
            data: await deletePettyCash(+id),
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
            message: 'Error deleting Petty Cash',
            details: error,
        })
    }
}
