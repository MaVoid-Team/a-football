import { z } from "zod";

export const paginationMetaSchema = z.object({
    totalCount: z.number(),
    page: z.number(),
    perPage: z.number(),
    totalPages: z.number(),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

export const apiErrorSchema = z.object({
    error: z.string().optional(),
    errors: z.array(z.string()).optional(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
