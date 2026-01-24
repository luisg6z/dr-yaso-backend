import { Router } from 'express'
import {
    createFranchiseHandler,
    deleteFranchiseHandler,
    getAllFranchisesHandler,
    getFranchiseByIdHandler,
    updateFranchiseHandler,
} from './franchises.controller'
import { validate } from '../middleware/validate'
import {
    createFranchiseSchema,
    updateFranchiseSchema,
} from './franchises.schemas'
import { authenticate } from '../auth/middlewares/auth.middleware'
import { authorize } from '../auth/middlewares/authorize.middleware'
import { tipoUsuarioEnum } from '../db/schemas/Usuarios'

const franchiseRouter = Router()

/**
 * @swagger
 * /api/franchises:
 *   post:
 *     summary: Crear una franquicia
 *     tags:
 *       - Franchises
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FranchiseCreate'
 *     responses:
 *       201:
 *         description: Franquicia creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Franchise'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 */
franchiseRouter.post(
    '/',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0]]),
    validate(createFranchiseSchema),
    createFranchiseHandler,
)

/**
 * @swagger
 * /api/franchises:
 *   get:
 *     summary: Listar franquicias
 *     tags:
 *       - Franchises
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *           default: active
 *     responses:
 *       200:
 *         description: Lista de franquicias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Franchise'
 *                 paginate:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 */
franchiseRouter.get(
    '/',
    authenticate,
    authorize([
        tipoUsuarioEnum.enumValues[0],
        tipoUsuarioEnum.enumValues[1],
        tipoUsuarioEnum.enumValues[2],
        tipoUsuarioEnum.enumValues[3],
    ]),
    getAllFranchisesHandler,
)

/**
 * @swagger
 * /api/franchises/{id}:
 *   get:
 *     summary: Obtener franquicia por ID
 *     tags:
 *       - Franchises
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Franquicia encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Franchise'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: No encontrada
 */
franchiseRouter.get(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    getFranchiseByIdHandler,
)

/**
 * @swagger
 * /api/franchises/{id}:
 *   patch:
 *     summary: Actualizar franquicia por ID
 *     tags:
 *       - Franchises
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
 *             $ref: '#/components/schemas/FranchiseUpdate'
 *     responses:
 *       200:
 *         description: Franquicia actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Franchise'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: No encontrada
 */
franchiseRouter.patch(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0]]),
    validate(updateFranchiseSchema),
    updateFranchiseHandler,
)

/**
 * @swagger
 * /api/franchises/{id}:
 *   delete:
 *     summary: Desactivar (eliminar lógico) una franquicia por ID
 *     tags:
 *       - Franchises
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Franquicia desactivada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Franchise'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: No encontrada
 */
franchiseRouter.delete(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0]]),
    deleteFranchiseHandler,
)

export default franchiseRouter
