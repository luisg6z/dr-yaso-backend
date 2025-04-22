import { z } from "zod";
import { tiposVisitasEnum } from "../db/schemas/Visitas";


export const visitsSchema = z.object({
    id: z.number().int().positive(),
    type: z.enum(tiposVisitasEnum.enumValues),
    observation: z.string().max(200),
    date: z.string().date().default(() => new Date().toISOString()),
    directBeneficiaries: z.number().int().positive(),
    indirectBeneficiaries: z.number().int().positive(),
    healthPersonnelCount: z.number().int().positive(),
    locationId: z.number().int().positive().optional(),
})

export const createVisitSchema = visitsSchema.omit({ id: true }).merge(z.object({
    coordinatorId: z.number().int().positive().optional(),
    clownsIds: z.array(z.number().int().positive()).optional(),
    hallwaysIds: z.array(z.number().int().positive()).optional(),
}));
export const updateVisitSchema = visitsSchema.omit({ id: true }).partial();

export type Visit = z.infer<typeof visitsSchema>;
export type VisitCreate = z.infer<typeof createVisitSchema>;
export type VisitUpdate = z.infer<typeof updateVisitSchema>;