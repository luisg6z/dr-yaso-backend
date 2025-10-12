import { z } from 'zod'

export const countrySchema = z.object({
    id: z.number().positive(),
    name: z.string().min(1).max(50),
})

export const createCountrySchema = countrySchema.omit({ id: true })
export const updateCountrySchema = createCountrySchema.partial()

export type CountryCreate = z.infer<typeof createCountrySchema>

export type CountryUpdate = z.infer<typeof updateCountrySchema>
