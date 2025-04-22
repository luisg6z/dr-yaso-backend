import { z } from "zod";


export const idParamSchema = z.number().int().positive();

export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
})

export const idParam = z.object({
    id: idParamSchema,
})

export type IdParam = z.infer<typeof idParam>;
export type Pagination = z.infer<typeof paginationSchema>;