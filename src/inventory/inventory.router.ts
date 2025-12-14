import { Router } from 'express'
import { authenticate } from '../auth/middlewares/auth.middleware'
import { createInventoryMovementController, getMovementsForProductFranchiseController } from './inventory.controller'

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
router.get('/product/:productId', authenticate, getMovementsForProductFranchiseController)

export default router