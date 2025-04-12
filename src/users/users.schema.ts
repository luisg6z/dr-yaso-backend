import { z } from "zod";


export const userSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1).max(100),
    password: z.string().min(1).max(120),
    type: z.enum(['Superusuario','Comite','Registrador de visita','Coordinador']),
    email: z.string().email().max(120).optional(),
    franchiseId: z.number().int().positive().optional(),
})

export const createUserSchema = userSchema.omit({ id: true });
export const updateUserSchema = createUserSchema.partial().omit({
    type: true,
});

export type User = z.infer<typeof userSchema>;
export type UserCreate = z.infer<typeof createUserSchema>;
export type UserUpdate = z.infer<typeof updateUserSchema>;