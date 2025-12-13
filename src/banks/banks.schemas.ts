import { z } from 'zod'

/**
 * @swagger
 * components:
 *   schemas:
 *     Bank:
 *       type: object
 *       properties:
 *         cod:
 *           type: string
 *           description: Bank code (4 digits)
 *         name:
 *           type: string
 *           description: Bank name
 *     BankCreate:
 *       type: object
 *       required:
 *         - cod
 *         - name
 *       properties:
 *         cod:
 *           type: string
 *           description: Bank code (4 digits)
 *         name:
 *           type: string
 *           description: Bank name
 *       example:
 *         cod: "0102"
 *         name: "Banco de Venezuela"
 *     BankUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Bank name
 *       example:
 *         name: "Banco Mercantil"
 */

export const BankSchema = z.object({
    cod: z.string().length(4),
    name: z.string().min(1).max(100),
})

export const createBankSchema = BankSchema

export const updateBankSchema = BankSchema.pick({
    name: true,
})

export type Bank = z.infer<typeof BankSchema>
export type BankCreate = z.infer<typeof createBankSchema>
export type BankUpdate = z.infer<typeof updateBankSchema>
