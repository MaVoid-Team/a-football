import { z } from "zod";
import { perkSchema } from "./perk.schema";
import { hourlyRateSchema } from "./hourly-rate.schema";

export const courtSchema = z.object({
    id: z.string(),
    branch_id: z.number(),
    name: z.string(),
    price_per_hour: z.string(), // or number if API coerces, but Postman shows decimal
    active: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
    perks: z.array(perkSchema).optional(),
    hourly_rates: z.array(hourlyRateSchema).optional(),
});

export type Court = z.infer<typeof courtSchema>;

export const courtFormSchema = z.object({
    branch_id: z.number(),
    name: z.string().min(1, "Name is required"),
    price_per_hour: z.number().min(0, "Price must be positive"),
    active: z.boolean(),
});

export type CourtFormData = z.infer<typeof courtFormSchema>;
