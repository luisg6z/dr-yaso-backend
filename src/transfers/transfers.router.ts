import { Router } from 'express'
import {
    createTransferHandler,
    getTransfersHandler,
    respondToTransferHandler,
} from './transfers.controller'
import { authenticate } from '../auth/middlewares/auth.middleware'
import { authorize } from '../auth/middlewares/authorize.middleware'
import { validate } from '../middleware/validate'
import {
    createTransferSchema,
    updateTransferStatusSchema,
} from './transfers.schemas'
import { tipoUsuarioEnum } from '../db/schemas/Usuarios'

const transfersRouter = Router()

/**
 * @swagger
 * tags:
 *   name: Transfers
 *   description: API for managing volunteer transfers
 */

/**
 * @swagger
 * /api/transfers:
 *   post:
 *     summary: Request a transfer (Coordinator/Superuser)
 *     tags: [Transfers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransfer'
 *     responses:
 *       201:
 *         description: Transfer requested successfully
 */
transfersRouter.post(
    '/',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]), // Superusuario, Coordinador
    validate(createTransferSchema),
    createTransferHandler,
)

/**
 * @swagger
 * /api/transfers:
 *   get:
 *     summary: Get transfers (list)
 *     tags: [Transfers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transfers
 */
transfersRouter.get(
    '/',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    getTransfersHandler,
)

/**
 * @swagger
 * /api/transfers/{id}/status:
 *   patch:
 *     summary: Respond to transfer (Accept/Reject)
 *     tags: [Transfers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTransferStatus'
 *     responses:
 *       200:
 *         description: Transfer status updated
 */
transfersRouter.patch(
    '/:id/status',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    validate(updateTransferStatusSchema),
    respondToTransferHandler,
)

export default transfersRouter
