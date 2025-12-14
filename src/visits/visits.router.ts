import { Router } from 'express'
import { validate } from '../middleware/validate'
import { createVisitSchema, updateVisitSchema } from './visits.schema'
import {
    createVisitsHandler,
    deleteVisitHandler,
    getAllVisitsHandler,
    getVisitByIdHandler,
    updateVisitHandler,
} from './visits.controller'
import { authenticate } from '../auth/middlewares/auth.middleware'
import { authorize } from '../auth/middlewares/authorize.middleware'
import { tipoUsuarioEnum } from '../db/schemas/Usuarios'

import { visitsReportController } from './report.controller'

const visitsRouter = Router()

/**
 * @swagger
 * /api/visits/report:
 *   post:
 *     summary: Generate Visits Report
 *     tags: [Visits]
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
 */
visitsRouter.post(
    '/report',
    authenticate,
    authorize([
        tipoUsuarioEnum.enumValues[0],
        tipoUsuarioEnum.enumValues[2],
        tipoUsuarioEnum.enumValues[3],
    ]),
    visitsReportController,
)

visitsRouter.post(
    '/',
    authenticate,
    authorize([
        tipoUsuarioEnum.enumValues[0],
        tipoUsuarioEnum.enumValues[2],
        tipoUsuarioEnum.enumValues[3],
    ]),
    validate(createVisitSchema),
    createVisitsHandler,
)
visitsRouter.get(
    '/',
    authenticate,
    authorize([
        tipoUsuarioEnum.enumValues[0],
        tipoUsuarioEnum.enumValues[2],
        tipoUsuarioEnum.enumValues[3],
    ]),
    getAllVisitsHandler,
)
visitsRouter.get(
    '/:id',
    authenticate,
    authorize([
        tipoUsuarioEnum.enumValues[0],
        tipoUsuarioEnum.enumValues[2],
        tipoUsuarioEnum.enumValues[3],
    ]),
    getVisitByIdHandler,
)
visitsRouter.patch(
    '/:id',
    authenticate,
    authorize([
        tipoUsuarioEnum.enumValues[0],
        tipoUsuarioEnum.enumValues[2],
        tipoUsuarioEnum.enumValues[3],
    ]),
    validate(updateVisitSchema),
    updateVisitHandler,
)
visitsRouter.delete(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[2]]),
    deleteVisitHandler,
)

export default visitsRouter
