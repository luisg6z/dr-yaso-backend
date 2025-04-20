import { z } from "zod";

export const OccupationSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(60),
  description: z.string().min(1).max(120).optional(),
});

export const createOccupationSchema = OccupationSchema.omit({ id: true });
export const updateOccupationSchema = createOccupationSchema.partial();

export type Occupation = z.infer<typeof OccupationSchema>;

export type OccupationCreate = z.infer<typeof createOccupationSchema>;

export type OccupationUpdate = z.infer<typeof updateOccupationSchema>;
