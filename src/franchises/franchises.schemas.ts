import { z } from 'zod'

/**
 * @swagger
 * components:
 *   schemas:
 *     Franchise:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         rif:
 *           type: string
 *         name:
 *           type: string
 *         address:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         isActive:
 *           type: boolean
 *         city:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *         state:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *         country:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *         coordinator:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *
 *     FranchiseCreate:
 *       type: object
 *       required:
 *         - rif
 *         - name
 *         - address
 *         - phone
 *         - email
 *       properties:
 *         rif:
 *           type: string
 *         name:
 *           type: string
 *         address:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         isActive:
 *           type: boolean
 *         cityId:
 *           type: integer
 *         coordinatorId:
 *           type: integer
 *
 *     FranchiseUpdate:
 *       type: object
 *       properties:
 *         rif:
 *           type: string
 *         name:
 *           type: string
 *         address:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         isActive:
 *           type: boolean
 *         cityId:
 *           type: integer
 *         coordinatorId:
 *           type: integer
 */

export const franchiseSchema = z.object({
    id: z.number().int().positive(),
    rif: z.string().max(12),
    name: z.string().min(1).max(100),
    address: z.string().min(1).max(120),
    phone: z.string().min(1).max(12),
    email: z.string().email().max(60),
    isActive: z.boolean().default(true).optional(),
    cityId: z.number().int().positive().optional(),
    coordinatorId: z.number().int().positive().optional(),
})

export const createFranchiseSchema = franchiseSchema.omit({ id: true })

export const updateFranchiseSchema = createFranchiseSchema.partial()

export type Franchise = z.infer<typeof franchiseSchema>

export type FranchiseCreate = z.infer<typeof createFranchiseSchema>

export type FranchiseUpdate = z.infer<typeof updateFranchiseSchema>
