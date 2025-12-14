import { z } from 'zod'

export const stockReportSchema = z.object({
    datesRange: z
        .object({
            startDate: z.string().datetime().optional(),
            finishDate: z.string().datetime().optional(),
        })
        .optional(),
    franchisesIds: z.array(z.number().int().positive()).optional(),
    movementTypes: z.array(z.enum(['Entrada', 'Salida'])).optional(),
    format: z.enum(['excel', 'pdf', 'json']).default('json'),
})

export type StockReportFilters = z.infer<typeof stockReportSchema>
