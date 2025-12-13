import { Router } from 'express'
import { validate } from '../middleware/validate'
import { createBankAccountSchema, updateBankAccountSchema } from './bank-accounts.schemas'
import {
    createBankAccountHandler,
    getAllBankAccountsHandler,
    getBankAccountByIdHandler,
    updateBankAccountHandler,
    deleteBankAccountHandler,
} from './bank-accounts.controller'
import { authenticate } from '../auth/middlewares/auth.middleware'
import { authorize } from '../auth/middlewares/authorize.middleware'
import { tipoUsuarioEnum } from '../db/schemas/Usuarios'

const bankAccountsRouter = Router()

/**
 * @swagger
 * /api/bank-accounts:
 *   post:
 *     summary: Create a new bank account
 *     tags:
 *       - BankAccounts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BankAccountCreate'
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Unauthorized
 */
bankAccountsRouter.post(
    '/',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    validate(createBankAccountSchema),
    createBankAccountHandler,
)

/**
 * @swagger
 * /api/bank-accounts:
 *   get:
 *     summary: Get all bank accounts
 *     tags:
 *       - BankAccounts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of accounts
 */
bankAccountsRouter.get(
    '/',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    getAllBankAccountsHandler,
)

/**
 * @swagger
 * /api/bank-accounts/{id}:
 *   get:
 *     summary: Get bank account by ID
 *     tags:
 *       - BankAccounts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
bankAccountsRouter.get(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    getBankAccountByIdHandler,
)

/**
 * @swagger
 * /api/bank-accounts/{id}:
 *   put:
 *     summary: Update bank account
 *     tags:
 *       - BankAccounts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
bankAccountsRouter.put(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    validate(updateBankAccountSchema),
    updateBankAccountHandler,
)

/**
 * @swagger
 * /api/bank-accounts/{id}:
 *   delete:
 *     summary: Delete bank account
 *     tags:
 *       - BankAccounts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
bankAccountsRouter.delete(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    deleteBankAccountHandler,
)

export default bankAccountsRouter
