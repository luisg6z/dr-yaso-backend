import { z } from 'zod'
import { tiposVisitasEnum } from '../db/schemas/Visitas'

export const visitsReportFiltersSchema = z.object({
    dateRange: z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
    }),
    visitTypes: z.array(z.enum(tiposVisitasEnum.enumValues)).optional(),
    format: z.enum(['json', 'pdf', 'excel']).default('json'),
})

export type VisitsReportFilters = z.infer<typeof visitsReportFiltersSchema>
