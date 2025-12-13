import { Request, Response } from 'express'
import {
    createBank,
    getAllBanks,
    getBankByCod,
    updateBank,
    deleteBank,
} from './banks.service'
import { AppError } from '../common/errors/errors'
import { Pagination } from '../types/types'

export const createBankHandler = async (req: Request, res: Response) => {
    try {
        const bank = req.body
        res.status(201).json({
            data: await createBank(bank),
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
            message: 'Error creating Bank',
            details: error,
        })
    }
}

export const getAllBanksHandler = async (req: Request, res: Response) => {
    try {
        const pagination: Pagination = {
            page: +(req.query.page || 1),
            limit: +(req.query.limit || 10),
        }

        res.status(200).json(await getAllBanks(pagination))
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                details: error.details,
            })
            return
        }
        res.status(500).json({
            message: 'Error retrieving Banks',
            details: error,
        })
    }
}

export const getBankByCodHandler = async (req: Request, res: Response) => {
    try {
        const { cod } = req.params
        res.status(200).json({
            data: await getBankByCod(cod),
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
            message: 'Error retrieving Bank',
            details: error,
        })
    }
}

export const updateBankHandler = async (req: Request, res: Response) => {
    try {
        const { cod } = req.params
        const bank = req.body
        res.status(200).json({
            data: await updateBank(cod, bank),
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
            message: 'Error updating Bank',
            details: error,
        })
    }
}

export const deleteBankHandler = async (req: Request, res: Response) => {
    try {
        const { cod } = req.params
        res.status(200).json({
            data: await deleteBank(cod),
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
            message: 'Error deleting Bank',
            details: error,
        })
    }
}
