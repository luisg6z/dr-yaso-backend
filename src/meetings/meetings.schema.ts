import { z } from 'zod'

export const meetingsSchema = z.object({
    id: z.number().int().positive(),
    responsibleId: z.number().int().positive(),
    notes: z.string().max(200).optional(),
    franchiseId: z.number().int().positive(),
    type: z.enum([
        'Responsable de visita',
        'Redes Sociales',
        'Captación de recursos',
        'Administración y Contabilidad',
        'Formación',
        'Comité de convivencia y disciplina',
    ]),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
    }),
})

export const createMeetingSchema = meetingsSchema.omit({ id: true }).merge(
    z.object({
        volunteersIds: z.array(z.number().int().positive()).optional(),
    }),
)
export const updateMeetingSchema = createMeetingSchema.partial()

export type Meeting = z.infer<typeof meetingsSchema>
export type MeetingCreate = z.infer<typeof createMeetingSchema>
export type MeetingUpdate = z.infer<typeof updateMeetingSchema>
