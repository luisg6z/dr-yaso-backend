import { z } from 'zod'

/**
 * @swagger
 * components:
 *   schemas:
 *     BankAccount:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         accountNumber:
 *           type: string
 *         currency:
 *           type: string
 *           enum: [VES, USD, EUR]
 *         balance:
 *           type: number
 *         franchiseId:
 *           type: integer
 *         bankCode:
 *           type: string
 *         responsibleId:
 *           type: integer
 *         responsible:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             documentType:
 *               type: string
 *             documentNumber:
 *               type: string
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *         bankName:
 *           type: string
 *         franchiseName:
 *           type: string
 *     BankAccountCreate:
 *       type: object
 *       required:
 *         - accountNumber
 *         - currency
 *         - franchiseId
 *         - bankCode
 *         - responsible
 *       properties:
 *         accountNumber:
 *           type: string
 *         currency:
 *           type: string
 *           enum: [VES, USD, EUR]
 *         franchiseId:
 *           type: integer
 *         bankCode:
 *           type: string
 *         responsible:
 *           type: object
 *           required:
 *             - documentType
 *             - documentNumber
 *             - firstName
 *             - lastName
 *           properties:
 *             documentType:
 *               type: string
 *               enum: [V, E, J, G]
 *             documentNumber:
 *               type: string
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *     BankAccountUpdate:
 *       type: object
 *       properties:
 *         accountNumber:
 *           type: string
 *         bankCode:
 *           type: string
 *         responsible:
 *           type: object
 *           properties:
 *             documentType:
 *               type: string
 *             documentNumber:
 *               type: string
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 */

export const ResponsibleSchema = z.object({
    documentType: z.enum(['V', 'E', 'J', 'G']),
    documentNumber: z.string().min(1).max(20),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
})

export const BankAccountSchema = z.object({
    id: z.number().int().positive(),
    accountNumber: z.string().min(1).max(20),
    currency: z.enum(['VES', 'USD', 'EUR']),
    balance: z.number(),
    franchiseId: z.number().int().positive(),
    bankCode: z.string().length(4),
    responsibleId: z.number().int().positive(),
    responsible: ResponsibleSchema, // Nested object for creation/response
})

export const createBankAccountSchema = z.object({
    accountNumber: z.string().min(1).max(20),
    currency: z.enum(['VES', 'USD', 'EUR']),
    franchiseId: z.number().int().positive(),
    bankCode: z.string().length(4),
    responsible: ResponsibleSchema,
})

export const updateBankAccountSchema = z.object({
    accountNumber: z.string().min(1).max(20).optional(),
    bankCode: z.string().length(4).optional(),
    responsible: ResponsibleSchema.partial().optional(), // Allow partial updates to responsible? Or maybe full replacement? Let's assume partial for now or we might need to separate logic. Actually updating responsible info usually means updating the person entity.
    // Simplifying update: update account number, bank, or responsible person details.
})

export type BankAccount = z.infer<typeof BankAccountSchema>
export type BankAccountCreate = z.infer<typeof createBankAccountSchema>
export type BankAccountUpdate = z.infer<typeof updateBankAccountSchema>
