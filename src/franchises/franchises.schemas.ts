import { z } from "zod";


export const franchiseSchema = z.object({
    id: z.number().int().positive(),
    rif: z.string().max(12),
    name: z.string().min(1).max(100),
    address: z.string().min(1).max(120),
    phone: z.string().min(1).max(12),
    email: z.string().email().max(60),
    isActive: z.boolean().default(true).optional(),
    cityId: z.number().int().positive().optional(),
    coordinatorId: z.number().int().positive().optional(),
})

export const createFranchiseSchema = franchiseSchema.omit({ id: true });
export const updateFranchiseSchema = createFranchiseSchema.partial()

export type Franchise = z.infer<typeof franchiseSchema>;

export type FranchiseCreate = z.infer<typeof createFranchiseSchema>;

export type FranchiseUpdate = z.infer<typeof updateFranchiseSchema>;
