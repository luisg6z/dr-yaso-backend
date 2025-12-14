import { Router } from 'express'
import { authenticate } from '../auth/middlewares/auth.middleware'
import { authorize } from '../auth/middlewares/authorize.middleware'
import { tipoUsuarioEnum } from '../db/schemas/Usuarios'
import {
    createInventoryMovementController,
    getMovementsForProductFranchiseController,
    getInventoryMovementsController,
} from './inventory.controller'
import { generateStockReportController } from './report.controller'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Movimientos de inventario por producto/franquicia
 */

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Registra un movimiento de inventario
 *     description: Calcula el saldo final en base al último movimiento. Evita saldos negativos en salidas.
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idProducto, idFranquicia, tipoMovimiento, cantidad, observacion]
 *             properties:
 *               idProducto:
 *                 type: integer
 *               idFranquicia:
 *                 type: integer
 *               tipoMovimiento:
 *                 type: string
 *                 enum: [Entrada, Salida]
 *               cantidad:
 *                 type: integer
 *                 minimum: 1
 *               observacion:
 *                 type: string
 *                 maxLength: 200
 *           example:
 *             idProducto: 1
 *             idFranquicia: 2
 *             tipoMovimiento: "Entrada"
 *             cantidad: 10
 *             observacion: "Compra mensual"
 *     responses:
 *       201:
 *         description: Movimiento registrado
 *       400:
 *         description: Body inválido o saldo insuficiente
 *       401:
 *         description: No autorizado
 */
router.post('/', authenticate, createInventoryMovementController)
/**
 * @swagger
 * /api/inventory/report:
 *   post:
 *     summary: Genera un reporte de movimientos de stock
 *     description: Devuelve los movimientos filtrados y un resumen de totales. Puede responder en JSON, Excel (xlsx) o PDF.
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               datesRange:
 *                 type: object
 *                 properties:
 *                   startDate:
 *                     type: string
 *                     format: date-time
 *                   finishDate:
 *                     type: string
 *                     format: date-time
 *               franchisesIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               movementTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Entrada, Salida]
 *               format:
 *                 type: string
 *                 enum: [excel, pdf, json]
 *                 default: json
 *           example:
 *             datesRange:
 *               startDate: "2025-12-01T00:00:00Z"
 *               finishDate: "2025-12-14T23:59:59Z"
 *             franchisesIds: [1, 2]
 *             movementTypes: ["Entrada", "Salida"]
 *             format: "json"
 *     responses:
 *       200:
 *         description: Archivo o JSON del reporte
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idMovimiento:
 *                         type: integer
 *                       nombreArticulo:
 *                         type: string
 *                       nombreSede:
 *                         type: string
 *                       tipoMovimiento:
 *                         type: string
 *                         enum: [Entrada, Salida]
 *                       cantidad:
 *                         type: integer
 *                       saldoFinal:
 *                         type: integer
 *                       fechaHora:
 *                         type: string
 *                         format: date-time
 *                       observacion:
 *                         type: string
 *                       usuarioNombre:
 *                         type: string
 *                         nullable: true
 *                 resumen:
 *                   type: object
 *                   properties:
 *                     totalEntradas:
 *                       type: integer
 *                     totalSalidas:
 *                       type: integer
 *                     saldoNeto:
 *                       type: integer
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.post('/report', authenticate, generateStockReportController)
router.get(
    '/product/:productId',
    authenticate,
    getMovementsForProductFranchiseController,
)

/**
 * @swagger
 * /api/inventory/movements:
 *   get:
 *     summary: Get paginated inventory movements
 *     description: Retrieve a list of inventory movements, optionally filtered by franchise.
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: franchiseId
 *         schema:
 *           type: integer
 *         description: Filter by franchise ID
 *     responses:
 *       200:
 *         description: List of movements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
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
 */
router.get(
    '/movements',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    getInventoryMovementsController,
)

export default router
