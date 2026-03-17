import { z } from "zod";

export const eventSchema = z.object({
    id: z.string(),
    branch_id: z.number(),
    title: z.string(),
    description: z.string().nullable().optional(),
    start_date: z.string(),
    participation_price: z.string().nullable().optional(),
    max_participants: z.number().nullable().optional(),
    remaining_spots: z.number().nullable().optional(),
    whatsapp_redirect_link: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
});

export type Event = z.infer<typeof eventSchema>;

export const eventFormSchema = z.object({
    branch_id: z.number(),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    start_date: z.string(),
    participation_price: z.number().min(0).optional(),
    max_participants: z.number().min(1, "Must be at least 1 participant").optional(),
});

export type EventFormData = z.infer<typeof eventFormSchema>;
