import { z } from "zod";

export const StateSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  countryId: z.number().int().positive(),
});

export const createStateSchema = StateSchema.omit({ id: true });

export type State = z.infer<typeof StateSchema>;

export type StateCreate = z.infer<typeof createStateSchema>;


