import { z } from 'zod'

export const CitySchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1).max(100),
    CityId: z.number().int().positive(),
})

export const createCitySchema = CitySchema.omit({ id: true })

export type City = z.infer<typeof CitySchema>

export type CityCreate = z.infer<typeof createCitySchema>
