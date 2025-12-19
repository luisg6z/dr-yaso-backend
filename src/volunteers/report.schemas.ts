import { z } from 'zod'
import { tiposVisitasEnum } from '../db/schemas/Visitas'

export const volunteerAttendanceReportFiltersSchema = z.object({
    dateRange: z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
    }),
    franchiseId: z.number().int().positive().optional(),
    visitTypes: z.array(z.enum(tiposVisitasEnum.enumValues)).optional(),
    format: z.enum(['json', 'pdf', 'excel']).default('json'),
})

export type VolunteerAttendanceReportFilters = z.infer<typeof volunteerAttendanceReportFiltersSchema>
