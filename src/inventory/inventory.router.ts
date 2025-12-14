import { Router } from 'express'
import { authenticate } from '../auth/middlewares/auth.middleware'
import { createInventoryMovementController, getMovementsForProductFranchiseController } from './inventory.controller'
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
 *               rangoFechas:
 *                 type: object
 *                 properties:
 *                   fechaInicio:
 *                     type: string
 *                     format: date-time
 *                   fechaFin:
 *                     type: string
 *                     format: date-time
 *               sedesIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               tiposMovimiento:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Entrada, Salida]
 *               formato:
 *                 type: string
 *                 enum: [excel, pdf, json]
 *                 default: json
 *           example:
 *             rangoFechas:
 *               fechaInicio: "2025-12-01T00:00:00Z"
 *               fechaFin: "2025-12-14T23:59:59Z"
 *             sedesIds: [1, 2]
 *             tiposMovimiento: ["Entrada", "Salida"]
 *             formato: "json"
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
router.get('/product/:productId', authenticate, getMovementsForProductFranchiseController)

export default router