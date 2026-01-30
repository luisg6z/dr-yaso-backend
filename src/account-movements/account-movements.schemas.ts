import { z } from 'zod'
import { tipoMovimientoEnum } from '../db/schemas/MovimientosCuentas'

/**
 * @swagger
 * components:
 *   schemas:
 *     AccountMovement:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         date:
 *           type: string
 *           format: date-time
 *         referenceNumber:
 *           type: string
 *         movementType:
 *           type: string
 *           enum: tipoMovimientoEnum.enumValues
 *         observation:
 *           type: string
 *         income:
 *           type: number
 *         expense:
 *           type: number
 *         balanceAfter:
 *           type: number
 *         accountId:
 *           type: integer
 *     AccountMovementCreate:
 *       type: object
 *       required:
 *         - date
 *         - referenceNumber
 *         - movementType
 *         - observation
 *         - accountId
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *         referenceNumber:
 *           type: string
 *         movementType:
 *           type: string
 *           enum: tipoMovimientoEnum.enumValues
 *         observation:
 *           type: string
 *         income:
 *           type: number
 *         expense:
 *           type: number
 *         accountId:
 *           type: integer
 */

export const AccountMovementSchema = z.object({
    id: z.number().int().positive(),
    date: z.string().datetime(),
    referenceNumber: z.string().min(1).max(20),
    movementType: z.enum(tipoMovimientoEnum.enumValues),
    observation: z.string().min(1).max(30),
    income: z.number().min(0).default(0),
    expense: z.number().min(0).default(0),
    balanceAfter: z.number(),
    accountId: z.number().int().positive(),
})

export const createAccountMovementSchema = z
    .object({
        date: z
            .string()
            .datetime()
            .or(z.date().transform((d) => d.toISOString())),
        referenceNumber: z.string().min(1).max(20),
        movementType: z.enum(tipoMovimientoEnum.enumValues),
        observation: z.string().min(1).max(30),
        income: z.number().min(0).default(0),
        expense: z.number().min(0).default(0),
        accountId: z.number().int().positive(),
    })
    .refine((data) => data.income > 0 || data.expense > 0, {
        message: 'Either income or expense must be greater than 0',
    })

export type AccountMovement = z.infer<typeof AccountMovementSchema>
export type AccountMovementCreate = z.infer<typeof createAccountMovementSchema>
