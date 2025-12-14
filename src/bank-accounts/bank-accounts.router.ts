import { Router } from 'express'
import { validate } from '../middleware/validate'
import {
    createBankAccountSchema,
    updateBankAccountSchema,
} from './bank-accounts.schemas'
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
import { bankReportController } from './report.controller'
import { bankReportFiltersSchema } from './report.schemas'

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

/**
 * @swagger
 * /api/bank-accounts/report:
 *   post:
 *     summary: Genera reporte de movimientos bancarios
 *     tags:
 *       - BankAccounts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dateRange:
 *                 type: object
 *                 properties:
 *                   startDate:
 *                     type: string
 *                     format: date-time
 *                   endDate:
 *                     type: string
 *                     format: date-time
 *               bankAccountId:
 *                 type: integer
 *               movementTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Transferencia, Pago Móvil, Depósito, Retiro, Cheque, Tarjeta]
 *               format:
 *                 type: string
 *                 enum: [json, excel, pdf]
 *     description: El reporte se genera por cuenta. Los montos se muestran en la moneda de la cuenta (VES/USD/EUR) y se formatea el documento acorde.
 *     responses:
 *       200:
 *         description: Recurso retornado o archivo descargado
 */
bankAccountsRouter.post(
    '/report',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    // validate(bankReportFiltersSchema), // Validation is done inside controller to handle safeParse
    bankReportController,
)
