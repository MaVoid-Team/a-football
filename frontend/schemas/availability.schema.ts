import { z } from "zod";

export const availableSlotSchema = z.object({
    start_time: z.string(),
    end_time: z.string(),
});

export type AvailableSlot = z.infer<typeof availableSlotSchema>;

export const availabilitySchema = z.object({
    branch_id: z.number(),
    court_id: z.number(),
    date: z.string(),
    available_slots: z.array(availableSlotSchema),
});

export type AvailabilityResponse = z.infer<typeof availabilitySchema>;
