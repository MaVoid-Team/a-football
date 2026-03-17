import { z } from "zod";

export const perkSchema = z.object({
    id: z.string(),
    court_id: z.number(),
    name: z.string(),
    description: z.string().nullable().optional(),
    active: z.boolean(),
    position: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
});

export type Perk = z.infer<typeof perkSchema>;

export const perkFormSchema = z.object({
    name: z.string().min(1, "Perk name is required"),
    description: z.string().optional(),
    active: z.boolean(),
});

export type PerkFormData = z.infer<typeof perkFormSchema>;
