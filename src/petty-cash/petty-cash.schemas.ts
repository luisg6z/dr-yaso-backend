import { z } from 'zod'

/**
 * @swagger
 * components:
 *   schemas:
 *     PettyCash:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         code:
 *           type: string
 *         name:
 *           type: string
 *         balance:
 *           type: number
 *         currency:
 *           type: string
 *           enum: [VES, USD, EUR]
 *         franchiseId:
 *           type: integer
 *         responsibleId:
 *           type: integer
 *         responsibleName:
 *           type: string
 *         franchiseName:
 *           type: string
 *     PettyCashCreate:
 *       type: object
 *       required:
 *         - code
 *         - name
 *         - currency
 *         - franchiseId
 *         - responsibleId
 *       properties:
 *         code:
 *           type: string
 *         name:
 *           type: string
 *         currency:
 *           type: string
 *           enum: [VES, USD, EUR]
 *         franchiseId:
 *           type: integer
 *         responsibleId:
 *           type: integer
 *       example:
 *         code: "CAJA-001"
 *         name: "Caja Chica Principal"
 *         currency: "USD"
 *         franchiseId: 1
 *         responsibleId: 5
 *     PettyCashUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         responsibleId:
 *           type: integer
 */

export const PettyCashSchema = z.object({
    id: z.number().int().positive(),
    code: z.string().min(1).max(20),
    name: z.string().min(1).max(100),
    balance: z.number(),
    currency: z.enum(['VES', 'USD', 'EUR']),
    franchiseId: z.number().int().positive(),
    responsibleId: z.number().int().positive(),
})

export const createPettyCashSchema = PettyCashSchema.omit({
    id: true,
    balance: true,
})

export const updatePettyCashSchema = PettyCashSchema.partial()

export type PettyCash = z.infer<typeof PettyCashSchema>
export type PettyCashCreate = z.infer<typeof createPettyCashSchema>
export type PettyCashUpdate = z.infer<typeof updatePettyCashSchema>
