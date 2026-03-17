import { z } from "zod";

export const blockedSlotSchema = z.object({
    id: z.string(),
    branch_id: z.number(),
    court_id: z.number(),
    date: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    reason: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
});

export type BlockedSlot = z.infer<typeof blockedSlotSchema>;

export const blockedSlotFormSchema = z.object({
    branch_id: z.number(),
    court_id: z.number(),
    date: z.string(),
    start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    reason: z.string().min(1, "Reason is required"),
}).refine(
    (data) => {
        // Basic string comparison works for HH:MM format
        return data.end_time > data.start_time;
    },
    {
        message: "End time must be after start time",
        path: ["end_time"],
    }
);

export type BlockedSlotFormData = z.infer<typeof blockedSlotFormSchema>;
