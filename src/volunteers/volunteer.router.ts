import { Router } from 'express'
import { validate } from '../middleware/validate'
import {
    createVolunteerSchema,
    updateVolunteerSchema,
} from './volunteer.schemas'
import {
    createVolunteerHandler,
    getVolunteerByIdHandler,
    getAllVolunteersHandler,
    updateVolunteerHandler,
    deleteVolunteerHandler,
} from './volunteer.controller'
import { authenticate } from '../auth/middlewares/auth.middleware'
import { authorize } from '../auth/middlewares/authorize.middleware'
import { tipoUsuarioEnum } from '../db/schemas/Usuarios'

const volunteersRouter = Router()

/**
 * @swagger
 * /api/volunteers:
 *   post:
 *     summary: Crear un nuevo voluntario
 *     tags:
 *       - Volunteers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VolunteerCreate'
 *     responses:
 *       201:
 *         description: Voluntario creado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 */
volunteersRouter.post(
    '/',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    validate(createVolunteerSchema),
    createVolunteerHandler,
)

/**
 * @swagger
 * /api/volunteers/{id}:
 *   get:
 *     summary: Obtener un voluntario por ID
 *     tags:
 *       - Volunteers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del voluntario
 *     responses:
 *       200:
 *         description: Voluntario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Volunteer'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Voluntario no encontrado
 */
volunteersRouter.get(
    '/:id',
    authenticate,
    authorize([
        tipoUsuarioEnum.enumValues[0],
        tipoUsuarioEnum.enumValues[1],
        tipoUsuarioEnum.enumValues[2],
        tipoUsuarioEnum.enumValues[3],
    ]),
    getVolunteerByIdHandler,
)

/**
 * @swagger
 * /api/volunteers:
 *   get:
 *     summary: Obtener todos los voluntarios
 *     tags:
 *       - Volunteers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de voluntarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Volunteer'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Voluntarios no encontrados
 */
volunteersRouter.get(
    '/',
    authenticate,
    authorize([
        tipoUsuarioEnum.enumValues[0],
        tipoUsuarioEnum.enumValues[1],
        tipoUsuarioEnum.enumValues[2],
        tipoUsuarioEnum.enumValues[3],
    ]),
    getAllVolunteersHandler,
)

/**
 * @swagger
 * /api/volunteers/{id}:
 *   put:
 *     summary: Actualizar un voluntario por ID
 *     tags:
 *       - Volunteers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del voluntario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VolunteerUpdate'
 *     responses:
 *       200:
 *         description: Voluntario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Volunteer'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Voluntario no encontrado
 */
volunteersRouter.put(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    validate(updateVolunteerSchema),
    updateVolunteerHandler,
)

volunteersRouter.delete(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    deleteVolunteerHandler,
)

/**
 * @swagger
 * /api/volunteers/{id}:
 *   get:
 *     summary: Obtener voluntario por ID
 *     tags:
 *       - Volunteers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del voluntario
 *     responses:
 *       200:
 *         description: Voluntario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Volunteer'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Voluntario no encontrado
 */
volunteersRouter.get(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    getVolunteerByIdHandler,
)

export default volunteersRouter
