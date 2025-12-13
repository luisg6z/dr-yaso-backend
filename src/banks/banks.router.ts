import { Router } from 'express'
import { validate } from '../middleware/validate'
import { createBankSchema, updateBankSchema } from './banks.schemas'
import {
    createBankHandler,
    getAllBanksHandler,
    getBankByCodHandler,
    updateBankHandler,
    deleteBankHandler,
} from './banks.controller'
import { authenticate } from '../auth/middlewares/auth.middleware'
import { authorize } from '../auth/middlewares/authorize.middleware'
import { tipoUsuarioEnum } from '../db/schemas/Usuarios'

const banksRouter = Router()

/**
 * @swagger
 * /api/banks:
 *   post:
 *     summary: Create a new bank
 *     tags:
 *       - Banks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BankCreate'
 *     responses:
 *       201:
 *         description: Bank created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
banksRouter.post(
    '/',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0]]), // Superuser only
    validate(createBankSchema),
    createBankHandler,
)

/**
 * @swagger
 * /api/banks:
 *   get:
 *     summary: Get all banks
 *     tags:
 *       - Banks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of banks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bank'
 *       401:
 *         description: Unauthorized
 */
banksRouter.get(
    '/',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]), // Superuser and Coordinator
    getAllBanksHandler,
)

/**
 * @swagger
 * /api/banks/{cod}:
 *   get:
 *     summary: Get bank by Code
 *     tags:
 *       - Banks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cod
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank Code
 *     responses:
 *       200:
 *         description: Bank found
 *       404:
 *         description: Bank not found
 *       401:
 *         description: Unauthorized
 */
banksRouter.get(
    '/:cod',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]), // Superuser and Coordinator
    getBankByCodHandler,
)

/**
 * @swagger
 * /api/banks/{cod}:
 *   put:
 *     summary: Update bank by Code
 *     tags:
 *       - Banks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cod
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank Code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BankUpdate'
 *     responses:
 *       200:
 *         description: Bank updated successfully
 *       404:
 *         description: Bank not found
 *       401:
 *         description: Unauthorized
 */
banksRouter.put(
    '/:cod',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0]]), // Superuser only
    validate(updateBankSchema),
    updateBankHandler,
)

/**
 * @swagger
 * /api/banks/{cod}:
 *   delete:
 *     summary: Delete bank by Code
 *     tags:
 *       - Banks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cod
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank Code
 *     responses:
 *       200:
 *         description: Bank deleted successfully
 *       404:
 *         description: Bank not found
 *       401:
 *         description: Unauthorized
 */
banksRouter.delete(
    '/:cod',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0]]), // Superuser only
    deleteBankHandler,
)

export default banksRouter
