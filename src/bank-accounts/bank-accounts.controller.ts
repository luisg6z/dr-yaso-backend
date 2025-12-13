import { Request, Response } from 'express'
import {
    createBankAccount,
    getAllBankAccounts,
    getBankAccountById,
    updateBankAccount,
    deleteBankAccount,
} from './bank-accounts.service'
import { AppError } from '../common/errors/errors'
import { Pagination } from '../types/types'

export const createBankAccountHandler = async (req: Request, res: Response) => {
    try {
        const data = req.body
        const user = res.locals.user

        if (user.role === 'Coordinador' && data.franchiseId !== user.franchiseId) {
            throw new AppError(403, 'Coordinators can only create accounts for their own franchise')
        }

        res.status(201).json({
            data: await createBankAccount(data),
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
            message: 'Error creating Bank Account',
            details: error,
        })
    }
}

export const getAllBankAccountsHandler = async (req: Request, res: Response) => {
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

        res.status(200).json(await getAllBankAccounts(pagination, franchiseId))
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                details: error.details,
            })
            return
        }
        res.status(500).json({
            message: 'Error retrieving Bank Accounts',
            details: error,
        })
    }
}

export const getBankAccountByIdHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const user = res.locals.user

        const account = await getBankAccountById(+id)

        if (user.role === 'Coordinador' && account.franchiseId !== user.franchiseId) {
            throw new AppError(403, 'Unauthorized access to this franchise data')
        }

        res.status(200).json({
            data: account,
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
            message: 'Error retrieving Bank Account',
            details: error,
        })
    }
}

export const updateBankAccountHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const data = req.body
        const user = res.locals.user

        const existingAccount = await getBankAccountById(+id)
        if (user.role === 'Coordinador' && existingAccount.franchiseId !== user.franchiseId) {
            throw new AppError(403, 'Unauthorized access to this franchise data')
        }

        res.status(200).json({
            data: await updateBankAccount(+id, data),
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
            message: 'Error updating Bank Account',
            details: error,
        })
    }
}

export const deleteBankAccountHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const user = res.locals.user

        const existingAccount = await getBankAccountById(+id)
        if (user.role === 'Coordinador' && existingAccount.franchiseId !== user.franchiseId) {
            throw new AppError(403, 'Unauthorized access to this franchise data')
        }

        res.status(200).json({
            data: await deleteBankAccount(+id),
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
            message: 'Error deleting Bank Account',
            details: error,
        })
    }
}
