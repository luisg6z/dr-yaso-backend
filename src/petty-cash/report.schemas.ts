import { z } from 'zod'

export const pettyCashReportSchema = z.object({
    dateRange: z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
    }),
    pettyCashId: z.number().int().positive(),
    format: z.enum(['json', 'excel', 'pdf']).optional().default('json'),
})

export type PettyCashReportFilters = z.infer<typeof pettyCashReportSchema>
