import { z } from 'zod'

/**
 * @swagger
 * components:
 *   schemas:
 *     CashMovement:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         date:
 *           type: string
 *           format: date-time
 *         observation:
 *           type: string
 *         income:
 *           type: number
 *         expense:
 *           type: number
 *         balanceAfter:
 *           type: number
 *         pettyCashId:
 *           type: integer
 *     CashMovementCreate:
 *       type: object
 *       required:
 *         - date
 *         - observation
 *         - pettyCashId
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *         observation:
 *           type: string
 *         income:
 *           type: number
 *         expense:
 *           type: number
 *         pettyCashId:
 *           type: integer
 */

export const CashMovementSchema = z.object({
    id: z.number().int().positive(),
    date: z.string().datetime(), // Or date() if just date, schema says timestamp
    observation: z.string().min(1).max(30),
    income: z.number().min(0).default(0),
    expense: z.number().min(0).default(0),
    balanceAfter: z.number(),
    pettyCashId: z.number().int().positive(),
})

export const createCashMovementSchema = z
    .object({
        date: z
            .string()
            .datetime()
            .or(z.date().transform((d) => d.toISOString())),
        observation: z.string().min(1).max(30),
        income: z.number().min(0).default(0),
        expense: z.number().min(0).default(0),
        pettyCashId: z.number().int().positive(),
    })
    .refine((data) => data.income > 0 || data.expense > 0, {
        message: 'Either income or expense must be greater than 0',
    })

export type CashMovement = z.infer<typeof CashMovementSchema>
export type CashMovementCreate = z.infer<typeof createCashMovementSchema>
