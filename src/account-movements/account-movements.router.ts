import { Router } from 'express'
import { validate } from '../middleware/validate'
import { createAccountMovementSchema } from './account-movements.schemas'
import {
    createAccountMovementHandler,
    getAllAccountMovementsHandler,
    getAccountMovementByIdHandler,
} from './account-movements.controller'
import { authenticate } from '../auth/middlewares/auth.middleware'
import { authorize } from '../auth/middlewares/authorize.middleware'
import { tipoUsuarioEnum } from '../db/schemas/Usuarios'

const accountMovementsRouter = Router()

/**
 * @swagger
 * /api/account-movements:
 *   post:
 *     summary: Create a new account movement
 *     tags:
 *       - AccountMovements
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccountMovementCreate'
 *     responses:
 *       201:
 *         description: Movement created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Unauthorized
 */
accountMovementsRouter.post(
    '/',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    validate(createAccountMovementSchema),
    createAccountMovementHandler,
)

/**
 * @swagger
 * /api/account-movements:
 *   get:
 *     summary: Get all account movements
 *     tags:
 *       - AccountMovements
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of movements
 */
accountMovementsRouter.get(
    '/',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    getAllAccountMovementsHandler,
)

/**
 * @swagger
 * /api/account-movements/{id}:
 *   get:
 *     summary: Get account movement by ID
 *     tags:
 *       - AccountMovements
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
accountMovementsRouter.get(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    getAccountMovementByIdHandler,
)

export default accountMovementsRouter
