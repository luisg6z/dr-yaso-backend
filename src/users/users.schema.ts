import { z } from "zod";
import { tipoUsuarioEnum } from "../db/schemas/Usuarios";

export const typeSchema = z.enum(tipoUsuarioEnum.enumValues)

export const userSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1).max(100),
    password: z.string().min(1).max(120),
    type: z.enum(tipoUsuarioEnum.enumValues),
    email: z.string().email().max(120).optional(),
    franchiseId: z.number().int().positive().optional(),
})

export const createUserSchema = userSchema.omit({ id: true });
export const updateUserSchema = createUserSchema.partial();

export type UserRole = z.infer<typeof typeSchema>
export type User = z.infer<typeof userSchema>;
export type UserCreate = z.infer<typeof createUserSchema>;
export type UserUpdate = z.infer<typeof updateUserSchema>;