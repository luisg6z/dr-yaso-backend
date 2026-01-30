import { Router } from 'express'
import { authenticate } from '../auth/middlewares/auth.middleware'
import {
    createProductController,
    updateProductController,
    deleteProductController,
    getProductByIdController,
    getAllProductsController,
    getProductsStockForFranchiseController,
    getProductStockForFranchiseController,
} from './products.controller'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Gestión de productos e inventario
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crea un producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, descripcion]
 *             properties:
 *               nombre:
 *                 type: string
 *                 maxLength: 50
 *               descripcion:
 *                 type: string
 *                 maxLength: 200
 *           example:
 *             nombre: "Guantes"
 *             descripcion: "Guantes talla M"
 *     responses:
 *       201:
 *         description: Producto creado
 *       400:
 *         description: Body inválido
 */
router.post('/', authenticate, createProductController)
/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualiza un producto
 *     tags: [Products]
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
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 maxLength: 50
 *               descripcion:
 *                 type: string
 *                 maxLength: 200
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       400:
 *         description: Body inválido
 *       404:
 *         description: Producto no encontrado
 */
router.put('/:id', authenticate, updateProductController)
/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Elimina un producto
 *     tags: [Products]
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
 *         description: Eliminado
 *       404:
 *         description: Producto no encontrado
 */
router.delete('/:id', authenticate, deleteProductController)
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtiene un producto por ID
 *     tags: [Products]
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
 *         description: Producto
 *       404:
 *         description: Producto no encontrado
 */
/**
 * @swagger
 * /api/products/stock:
 *   get:
 *     summary: Lista stock por franquicia
 *     description: Devuelve cada producto con su stock actual en la franquicia indicada.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: franchiseId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de productos con stock
 *       400:
 *         description: Parámetros inválidos
 */
router.get('/stock', authenticate, getProductsStockForFranchiseController)
/**
 * @swagger
 * /api/products/{id}/stock:
 *   get:
 *     summary: Obtiene el stock de un producto en una franquicia
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: franchiseId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Stock del producto en la franquicia
 *       400:
 *         description: Parámetros inválidos
 */
router.get('/:id/stock', authenticate, getProductStockForFranchiseController)
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtiene un producto por ID
 *     tags: [Products]
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
 *         description: Producto
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', authenticate, getProductByIdController)
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lista todos los productos
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get('/', authenticate, getAllProductsController)

export default router
