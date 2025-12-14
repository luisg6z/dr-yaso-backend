import { z } from 'zod'

export const movementCreateSchema = z.object({
    idProducto: z.number().int().positive(),
    idFranquicia: z.number().int().positive(),
    tipoMovimiento: z.enum(['Entrada', 'Salida']),
    cantidad: z.number().int().positive(),
    observacion: z.string().min(1).max(200),
})

export type MovementCreate = z.infer<typeof movementCreateSchema>