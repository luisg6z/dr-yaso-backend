import { z } from 'zod'

export const observationCreateSchema = z.object({
    idVoluntario: z.number().int().positive(),
    observacion: z.string().min(1).max(200),
})

export const observationUpdateSchema = z.object({
    idVoluntario: z.number().int().positive(),
    fechaHoraRegistro: z.string().datetime(), // ISO string for key
    observacion: z.string().min(1).max(200),
})

export type ObservationCreate = z.infer<typeof observationCreateSchema>
export type ObservationUpdate = z.infer<typeof observationUpdateSchema>