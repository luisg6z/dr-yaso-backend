import { z } from 'zod'

export const bankReportFiltersSchema = z.object({
    rangoFechas: z.object({
        fechaInicio: z.coerce.date(),
        fechaFin: z.coerce.date(),
    }),
    cuentaBancariaId: z.coerce.number().int().positive(),
    tiposMovimiento: z.array(z.string()).optional().default([]),
    formato: z.enum(['json', 'excel', 'pdf']).default('json'),
})

export type BankReportFilters = z.infer<typeof bankReportFiltersSchema>
