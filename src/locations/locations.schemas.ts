import { z } from "zod";

export const LocationSchema = z.object({
  id: z.number().int().positive(),
  description: z.string().min(1).max(60),
  FranchiseId: z.string().min(1).max(120).optional(),
});

export const createLocationSchema = LocationSchema.omit({ id: true });
export const updateLocationSchema = createLocationSchema.partial();

export type Location = z.infer<typeof LocationSchema>;

export type LocationCreate = z.infer<typeof createLocationSchema>;

export type LocationUpdate = z.infer<typeof updateLocationSchema>;

