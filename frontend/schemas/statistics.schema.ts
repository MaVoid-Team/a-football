import { z } from "zod";

export const bookingsPerCourtSchema = z.object({
    court_id: z.number(),
    court_name: z.string(),
    bookings_count: z.number(),
});

export const statisticsSchema = z.object({
    total_revenue: z.string(), // e.g. "15000.0"
    total_confirmed_bookings: z.number(),
    bookings_per_court: z.array(bookingsPerCourtSchema),
    occupancy_rate_percent: z.number(),
});

export type Statistics = z.infer<typeof statisticsSchema>;
// Read-only, no form schema needed
