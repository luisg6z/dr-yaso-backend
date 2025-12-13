import { Router } from 'express'
import { validate } from '../middleware/validate'
import { createPettyCashSchema, updatePettyCashSchema } from './petty-cash.schemas'
import {
    createPettyCashHandler,
    getAllPettyCashHandler,
    getPettyCashByIdHandler,
    updatePettyCashHandler,
    deletePettyCashHandler,
} from './petty-cash.controller'
import { authenticate } from '../auth/middlewares/auth.middleware'
import { authorize } from '../auth/middlewares/authorize.middleware'
import { tipoUsuarioEnum } from '../db/schemas/Usuarios'

const pettyCashRouter = Router()

/**
 * @swagger
 * /api/petty-cash:
 *   post:
 *     summary: Create a new petty cash
 *     tags:
 *       - PettyCash
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PettyCashCreate'
 *     responses:
 *       201:
 *         description: Petty Cash created successfully
 *       403:
 *         description: Unauthorized franchise access
 */
pettyCashRouter.post(
    '/',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]), // Superuser and Coordinator
    validate(createPettyCashSchema),
    createPettyCashHandler,
)

/**
 * @swagger
 * /api/petty-cash:
 *   get:
 *     summary: Get all petty cash (filtered by franchise for coordinator)
 *     tags:
 *       - PettyCash
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of petty cash
 */
pettyCashRouter.get(
    '/',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    getAllPettyCashHandler,
)

/**
 * @swagger
 * /api/petty-cash/{id}:
 *   get:
 *     summary: Get petty cash by ID
 *     tags:
 *       - PettyCash
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
pettyCashRouter.get(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    getPettyCashByIdHandler,
)

/**
 * @swagger
 * /api/petty-cash/{id}:
 *   put:
 *     summary: Update petty cash
 *     tags:
 *       - PettyCash
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
pettyCashRouter.put(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    validate(updatePettyCashSchema),
    updatePettyCashHandler,
)

/**
 * @swagger
 * /api/petty-cash/{id}:
 *   delete:
 *     summary: Delete petty cash
 *     tags:
 *       - PettyCash
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
pettyCashRouter.delete(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    deletePettyCashHandler,
)

export default pettyCashRouter
