import { Router } from 'express'
import { validate } from '../middleware/validate'
import { createCashMovementSchema } from './cash-movements.schemas'
import {
    createCashMovementHandler,
    getAllCashMovementsHandler,
    getCashMovementByIdHandler,
} from './cash-movements.controller'
import { authenticate } from '../auth/middlewares/auth.middleware'
import { authorize } from '../auth/middlewares/authorize.middleware'
import { tipoUsuarioEnum } from '../db/schemas/Usuarios'

const cashMovementsRouter = Router()

/**
 * @swagger
 * /api/cash-movements:
 *   post:
 *     summary: Create a new cash movement
 *     tags:
 *       - CashMovements
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CashMovementCreate'
 *     responses:
 *       201:
 *         description: Movement created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Unauthorized
 */
cashMovementsRouter.post(
    '/',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    validate(createCashMovementSchema),
    createCashMovementHandler,
)

/**
 * @swagger
 * /api/cash-movements:
 *   get:
 *     summary: Get all cash movements
 *     tags:
 *       - CashMovements
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of movements
 */
cashMovementsRouter.get(
    '/',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    getAllCashMovementsHandler,
)

/**
 * @swagger
 * /api/cash-movements/{id}:
 *   get:
 *     summary: Get cash movement by ID
 *     tags:
 *       - CashMovements
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
cashMovementsRouter.get(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    getCashMovementByIdHandler,
)

export default cashMovementsRouter
