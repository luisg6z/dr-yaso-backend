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
import { volunteerAttendanceReportController } from './report.controller'

const volunteersRouter = Router()

/**
 * @swagger
 * /api/volunteers/report/attendance:
 *   post:
 *     summary: Generate Volunteer Attendance Report
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dateRange
 *               - franchiseId
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
 *               franchiseId:
 *                 type: integer
 *               visitTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *               format:
 *                 type: string
 *                 enum: [json, excel, pdf]
 *                 default: json
 *     responses:
 *       200:
 *         description: Report generated
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden (Franchise mismatch)
 */
volunteersRouter.post(
    '/report/attendance',
    authenticate,
    authorize([
        tipoUsuarioEnum.enumValues[0],
        tipoUsuarioEnum.enumValues[2],
        tipoUsuarioEnum.enumValues[3],
    ]),
    volunteerAttendanceReportController,
)

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
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página (paginación)
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página (paginación)
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *           default: active
 *         description: Filtra por estatus de franquicia (activa/inactiva/todas)
 *       - in: query
 *         name: idFranquicia
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filtra por franquicia (solo aplica para Superusuario; para otros roles se fuerza su franquicia)
 *     responses:
 *       200:
 *         description: Lista paginada de voluntarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Volunteer'
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
