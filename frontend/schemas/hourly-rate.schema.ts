import { z } from "zod";

export const hourlyRateSchema = z.object({
    id: z.string(),
    court_id: z.number(),
    start_hour: z.number(),
    end_hour: z.number(),
    price_per_hour: z.string(),
    active: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
});

export type HourlyRate = z.infer<typeof hourlyRateSchema>;

export const hourlyRateFormSchema = z.object({
    start_hour: z.number().int().min(0).max(23),
    end_hour: z.number().int().min(1).max(24),
    price_per_hour: z.number().positive("Price must be greater than 0"),
    active: z.boolean(),
}).refine((data) => data.end_hour > data.start_hour, {
    message: "End hour must be greater than start hour",
    path: ["end_hour"],
});

export type HourlyRateFormData = z.infer<typeof hourlyRateFormSchema>;
