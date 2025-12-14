import { z } from 'zod'

export const createTransferSchema = z.object({
    volunteerId: z.number().int().positive(),
    originFranchiseId: z.number().int().positive(),
    destinationFranchiseId: z.number().int().positive(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
    }),
    reason: z.string().min(1),
    observation: z.string().optional(),
})

export const updateTransferStatusSchema = z.object({
    status: z.enum(['approved', 'rejected']),
})
