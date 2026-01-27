import { Router } from 'express'
import { validate } from '../middleware/validate'
import { createUserSchema, updateUserSchema } from './users.schema'
import {
    createUserHandler,
    deleteUserHandler,
    getAllUsersHandler,
    getUserByIdHandler,
    updateUserHandler,
} from './users.controller'
import { authorize } from '../auth/middlewares/authorize.middleware'
import { authenticate } from '../auth/middlewares/auth.middleware'
import { tipoUsuarioEnum } from '../db/schemas/Usuarios'

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Gestión de usuarios
 *
 * components:
 *   schemas:
 *     UserRole:
 *       type: string
 *       enum:
 *         - Superusuario
 *         - Comite
 *         - Registrador de visita
 *         - Coordinador
 *
 *     UserCreate:
 *       type: object
 *       additionalProperties: false
 *       required: [name, password, type]
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "Juan Pérez"
 *         password:
 *           type: string
 *           minLength: 1
 *           maxLength: 120
 *           example: "S3cret123!"
 *         type:
 *           $ref: "#/components/schemas/UserRole"
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 120
 *           example: "juan@correo.com"
 *           nullable: true
 *         franchiseId:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *           nullable: true
 *
 *     UserUpdate:
 *       type: object
 *       additionalProperties: false
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         password:
 *           type: string
 *           minLength: 1
 *           maxLength: 120
 *         type:
 *           $ref: "#/components/schemas/UserRole"
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 120
 *           nullable: true
 *         franchiseId:
 *           type: integer
 *           minimum: 1
 *           nullable: true
 *
 *     FranchiseLite:
 *       type: object
 *       additionalProperties: false
 *       required: [id, name]
 *       properties:
 *         id:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         name:
 *           type: string
 *           example: "Franquicia Centro"
 *
 *     UserWithFranchise:
 *       type: object
 *       additionalProperties: false
 *       required: [id, name, type]
 *       properties:
 *         id:
 *           type: integer
 *           minimum: 1
 *           example: 10
 *         name:
 *           type: string
 *           example: "Juan Pérez"
 *         type:
 *           $ref: "#/components/schemas/UserRole"
 *         email:
 *           type: string
 *           format: email
 *           nullable: true
 *         franchise:
 *           oneOf:
 *             - $ref: "#/components/schemas/FranchiseLite"
 *             - type: "null"
 *
 *     Paginate:
 *       type: object
 *       additionalProperties: false
 *       required: [page, limit, totalItems, totalPages]
 *       properties:
 *         page:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         limit:
 *           type: integer
 *           minimum: 1
 *           example: 10
 *         totalItems:
 *           type: integer
 *           minimum: 0
 *           example: 42
 *         totalPages:
 *           type: integer
 *           minimum: 0
 *           example: 5
 *
 *     UsersListResponse:
 *       type: object
 *       additionalProperties: false
 *       required: [items, paginate]
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/UserWithFranchise"
 *         paginate:
 *           $ref: "#/components/schemas/Paginate"
 *
 *     ApiError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         details:
 *           nullable: true
 *
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Crear un usuario
 *     description: Solo Superusuario y Coordinador pueden crear usuarios. No se permite crear Superusuario si no eres Superusuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UserCreate"
 *     responses:
 *       201:
 *         description: Usuario creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name: { type: string }
 *                       type: { $ref: "#/components/schemas/UserRole" }
 *                       email: { type: string, format: email, nullable: true }
 *                       franchiseId: { type: integer, nullable: true }
 *       400:
 *         description: Error de validación o regla de negocio
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/ApiError" }
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 *
 *   get:
 *     tags: [Users]
 *     summary: Listar usuarios (paginado)
 *     description: |
 *       - **Superusuario**: por defecto lista usuarios de todas las franquicias. Puede filtrar con `franchiseId`.
 *       - **Otros roles (incluye Coordinador)**: siempre lista solo usuarios de su propia franquicia (ignora `franchiseId`).
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, default: 10 }
 *       - in: query
 *         name: franchiseId
 *         required: false
 *         description: Filtro opcional por franquicia. Use `all` para todas.
 *         schema:
 *           oneOf:
 *             - type: integer
 *               minimum: 1
 *             - type: string
 *               enum: [all]
 *     responses:
 *       200:
 *         description: Lista paginada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UsersListResponse"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 *
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Obtener usuario por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/UserWithFranchise"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 *
 *   patch:
 *     tags: [Users]
 *     summary: Actualizar usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UserUpdate"
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer }
 *                       name: { type: string }
 *                       type: { $ref: "#/components/schemas/UserRole" }
 *                       email: { type: string, format: email, nullable: true }
 *                       franchiseId: { type: integer, nullable: true }
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/ApiError" }
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 *
 *   delete:
 *     tags: [Users]
 *     summary: Eliminar usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/ApiError" }
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */

const usersRouter = Router()

usersRouter.post(
    '/',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    validate(createUserSchema),
    createUserHandler,
)
usersRouter.get(
    '/',
    authenticate,
    authorize([
        tipoUsuarioEnum.enumValues[0],
        tipoUsuarioEnum.enumValues[1],
        tipoUsuarioEnum.enumValues[3],
    ]),
    getAllUsersHandler,
)
usersRouter.get(
    '/:id',
    authenticate,
    authorize([
        tipoUsuarioEnum.enumValues[0],
        tipoUsuarioEnum.enumValues[1],
        tipoUsuarioEnum.enumValues[3],
    ]),
    getUserByIdHandler,
)
usersRouter.patch(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0]]),
    validate(updateUserSchema),
    updateUserHandler,
)
usersRouter.delete(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0]]),
    deleteUserHandler,
)

export default usersRouter
