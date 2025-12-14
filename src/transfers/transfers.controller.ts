import { NextFunction, Request, Response } from 'express'
import * as transferService from './transfers.service'
import { AppError } from '../common/errors/errors'
import { Pagination } from '../types/types'

export const createTransferHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const user = res.locals.user
        const { idFranquiciaOrigen } = req.body

        // Verify that if role is Coordinador, they are requesting from their own franchise
        if (
            user.role === 'Coordinador' &&
            user.franchiseId !== idFranquiciaOrigen
        ) {
            throw new AppError(
                403,
                'You can only request transfers from your own franchise',
            )
        }

        const transfer = await transferService.createTransfer(req.body)
        res.status(201).json(transfer)
    } catch (error) {
        next(error)
    }
}

export const getTransfersHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const user = res.locals.user
        const pagination: Pagination = {
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 10,
        }

        if (user.role === 'Superusuario') {
            const transfers = await transferService.getAllTransfers(pagination)
            res.json(transfers)
        } else {
            const transfers = await transferService.getTransfersByFranchise(
                user.franchiseId,
                pagination,
            )
            res.json(transfers)
        }
    } catch (error) {
        next(error)
    }
}

export const respondToTransferHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params
        const { estado } = req.body
        const user = res.locals.user

        const transfer = await transferService.getTransferById(Number(id))
        if (!transfer) throw new AppError(404, 'Transfer not found')

        if (user.role === 'Coordinador') {
            if (transfer.idFranquiciaDestino !== user.franchiseId) {
                throw new AppError(
                    403,
                    'You can only respond to incoming transfers to your franchise',
                )
            }
        }

        const updated = await transferService.updateTransferStatus(
            Number(id),
            estado,
        )
        res.json(updated)
    } catch (error) {
        next(error)
    }
}
