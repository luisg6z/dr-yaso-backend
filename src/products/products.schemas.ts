import { z } from 'zod'

export const productCreateSchema = z.object({
    nombre: z.string().min(1).max(50),
    descripcion: z.string().min(1).max(200),
})

export const productUpdateSchema = productCreateSchema.partial()

export type ProductCreate = z.infer<typeof productCreateSchema>
export type ProductUpdate = z.infer<typeof productUpdateSchema>
