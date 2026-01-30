import { Router } from 'express'
import { authenticate } from '../auth/middlewares/auth.middleware'
import {
    createObservationController,
    getObservationsByVolunteerController,
    getObservationsByUserController,
    updateObservationController,
    deleteObservationController,
} from './observations.controller'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Observations
 *   description: Registro de observaciones a voluntarios
 */

/**
 * @swagger
 * /api/observations:
 *   post:
 *     summary: Crea una observación para un voluntario
 *     tags: [Observations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idVoluntario, observacion]
 *             properties:
 *               idVoluntario:
 *                 type: integer
 *               observacion:
 *                 type: string
 *                 maxLength: 200
 *           example:
 *             idVoluntario: 12
 *             observacion: "Llegó tarde a la reunión"
 *     responses:
 *       201:
 *         description: Observación creada
 *       400:
 *         description: Body inválido
 *       401:
 *         description: No autorizado
 */
router.post('/', authenticate, createObservationController)
/**
 * @swagger
 * /api/observations/volunteer/{id}:
 *   get:
 *     summary: Lista observaciones por voluntario
 *     tags: [Observations]
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
 *         description: Lista de observaciones
 *       401:
 *         description: No autorizado
 */
router.get('/volunteer/:id', authenticate, getObservationsByVolunteerController)
/**
 * @swagger
 * /api/observations/user/{id}:
 *   get:
 *     summary: Lista observaciones registradas por un usuario
 *     tags: [Observations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de observaciones
 *       401:
 *         description: No autorizado
 */
router.get('/user/:id', authenticate, getObservationsByUserController)
/**
 * @swagger
 * /api/observations:
 *   put:
 *     summary: Actualiza el texto de una observación
 *     description: Requiere la llave compuesta (idVoluntario, fechaHoraRegistro) y el nuevo texto.
 *     tags: [Observations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idVoluntario, fechaHoraRegistro, observacion]
 *             properties:
 *               idVoluntario:
 *                 type: integer
 *               fechaHoraRegistro:
 *                 type: string
 *                 format: date-time
 *               observacion:
 *                 type: string
 *                 maxLength: 200
 *           example:
 *             idVoluntario: 12
 *             fechaHoraRegistro: "2025-12-13T15:04:05.000Z"
 *             observacion: "Se corrigió la observación"
 *     responses:
 *       200:
 *         description: Observación actualizada
 *       400:
 *         description: Body inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Observación no encontrada
 */
router.put('/', authenticate, updateObservationController)
/**
 * @swagger
 * /api/observations:
 *   delete:
 *     summary: Elimina una observación
 *     description: Requiere la llave compuesta (idVoluntario, fechaHoraRegistro) como query params.
 *     tags: [Observations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idVoluntario
 *         schema:
 *           type: integer
 *         required: true
 *       - in: query
 *         name: fechaHoraRegistro
 *         schema:
 *           type: string
 *           format: date-time
 *         required: true
 *     responses:
 *       200:
 *         description: Eliminado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Observación no encontrada
 */
router.delete('/', authenticate, deleteObservationController)

export default router
