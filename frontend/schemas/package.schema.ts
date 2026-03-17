import { z } from "zod";

export const packageSchema = z.object({
    id: z.string(),
    branch_id: z.number().nullable(), // nullable for global packages
    title: z.string(),
    description: z.string().nullable().optional(),
    price: z.string(), // or number
    created_at: z.string(),
    updated_at: z.string(),
});

export type Package = z.infer<typeof packageSchema>;

export const packageFormSchema = z.object({
    branch_id: z.number().nullable().optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    price: z.number().min(0, "Price must be positive"),
});

export type PackageFormData = z.infer<typeof packageFormSchema>;
