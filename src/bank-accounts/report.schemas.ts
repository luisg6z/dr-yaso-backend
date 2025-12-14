import { z } from 'zod'

export const bankReportFiltersSchema = z.object({
    dateRange: z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
    }),
    bankAccountId: z.coerce.number().int().positive(),
    movementTypes: z
        .array(
            z.enum([
                'Transferencia',
                'Pago Móvil',
                'Depósito',
                'Retiro',
                'Cheque',
                'Tarjeta',
            ]),
        )
        .optional()
        .default([]),
    format: z.enum(['json', 'excel', 'pdf']).default('json'),
})

export type BankReportFilters = z.infer<typeof bankReportFiltersSchema>
