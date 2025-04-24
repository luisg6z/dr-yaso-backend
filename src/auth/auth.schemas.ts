import { z } from "zod";


export const loginSchema = z.object({
    name: z.string().min(1).max(100),
    password: z.string().min(6),
})

export type LoginSchema = z.infer<typeof loginSchema>;