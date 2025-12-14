import { z } from 'zod'

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateTransfer:
 *       type: object
 *       required:
 *         - volunteerId
 *         - originFranchiseId
 *         - destinationFranchiseId
 *         - date
 *         - reason
 *       properties:
 *         volunteerId:
 *           type: integer
 *           description: ID of the volunteer to transfer
 *         originFranchiseId:
 *           type: integer
 *           description: ID of the origin franchise
 *         destinationFranchiseId:
 *           type: integer
 *           description: ID of the destination franchise
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the transfer request (YYYY-MM-DD)
 *         reason:
 *           type: string
 *           description: Reason for the transfer
 *         observation:
 *           type: string
 *           description: Optional observations
 *       example:
 *         volunteerId: 1
 *         originFranchiseId: 1
 *         destinationFranchiseId: 2
 *         date: "2023-10-27"
 *         reason: "Relocating"
 *         observation: "Pending approval"
 *
 *     UpdateTransferStatus:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [approved, rejected]
 *           description: New status for the transfer
 */

export const createTransferSchema = z.object({
    volunteerId: z.number().int().positive(),
    originFranchiseId: z.number().int().positive(),
    destinationFranchiseId: z.number().int().positive(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
    }),
    reason: z.string().min(1),
})

export const updateTransferStatusSchema = z.object({
    status: z.enum(['approved', 'rejected']),
    observation: z.string().optional(),
})
