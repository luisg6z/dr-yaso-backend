import { Router } from 'express'
import { validate } from '../middleware/validate'
import {
    createPettyCashSchema,
    updatePettyCashSchema,
} from './petty-cash.schemas'
import {
    createPettyCashHandler,
    getAllPettyCashHandler,
    getPettyCashByIdHandler,
    updatePettyCashHandler,
    deletePettyCashHandler,
} from './petty-cash.controller'
import { getReport } from './report.controller'
import { authenticate } from '../auth/middlewares/auth.middleware'
import { authorize } from '../auth/middlewares/authorize.middleware'
import { tipoUsuarioEnum } from '../db/schemas/Usuarios'

const pettyCashRouter = Router()

/**
 * @swagger
 * /api/petty-cash/report:
 *   post:
 *     summary: Generate Petty Cash Report (JSON, Excel, PDF)
 *     tags:
 *       - PettyCash
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
 *               - pettyCashId
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
 *               pettyCashId:
 *                 type: integer
 *               format:
 *                 type: string
 *                 enum: [json, excel, pdf]
 *                 default: json
 *             example:
 *               dateRange:
 *                 startDate: "2025-12-13T20:37:28.320Z"
 *                 endDate: "2025-12-15T20:37:28.320Z"
 *               pettyCashId: 6
 *               format: "pdf"
 *     responses:
 *       200:
 *         description: Report generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
pettyCashRouter.post(
    '/report',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    getReport,
)

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
