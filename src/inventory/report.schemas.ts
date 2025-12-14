import { z } from 'zod'

export const stockReportSchema = z.object({
    rangoFechas: z
        .object({
            fechaInicio: z.string().datetime().optional(),
            fechaFin: z.string().datetime().optional(),
        })
        .optional(),
    sedesIds: z.array(z.number().int().positive()).optional(),
    tiposMovimiento: z.array(z.enum(['Entrada', 'Salida'])).optional(),
    formato: z.enum(['excel', 'pdf', 'json']).default('json'),
})

export type StockReportFilters = z.infer<typeof stockReportSchema>