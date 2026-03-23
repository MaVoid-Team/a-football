import { z } from "zod";

export const promoCodeSchema = z.object({
    id: z.string(),
    code: z.string(),
    description: z.string(),
    discount_percentage: z.number().nullable().optional(),
    discount_amount: z.number().nullable().optional(),
    minimum_amount: z.number().nullable().optional(),
    usage_limit: z.number().nullable().optional(),
    used_count: z.number(),
    starts_at: z.string(),
    expires_at: z.string().nullable().optional(),
    active: z.boolean(),
    branch_id: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
});

export type PromoCode = z.infer<typeof promoCodeSchema>;

export const promoCodeFormSchema = z.object({
    code: z.string().min(1, "Code is required").max(20, "Code must be less than 20 characters"),
    description: z.string().min(1, "Description is required"),
    discount_type: z.enum(["percentage", "amount"]),
    discount_percentage: z.number().min(1, "Must be at least 1%").max(100, "Must be at most 100%").optional(),
    discount_amount: z.number().min(0.01, "Must be at least 0.01").optional(),
    minimum_amount: z.number().min(0, "Must be 0 or greater").optional(),
    usage_limit: z.number().min(1, "Must be at least 1").optional(),
    starts_at: z.string().min(1, "Start date is required"),
    expires_at: z.string().optional(),
    active: z.boolean(),
}).refine((data) => {
    if (data.discount_type === "percentage") {
        return data.discount_percentage !== undefined;
    } else {
        return data.discount_amount !== undefined;
    }
}, {
    message: "Discount value is required based on discount type",
    path: ["discount_type"],
});

export type PromoCodeFormData = z.infer<typeof promoCodeFormSchema>;

export const promoCodeValidationSchema = z.object({
    code: z.string(),
    total_amount: z.number().min(0),
    court_id: z.number().int().positive().optional(),
    booking_slots_attributes: z.array(
        z.object({
            start_time: z.string(),
            end_time: z.string(),
        })
    ).optional(),
});

export type PromoCodeValidationData = z.infer<typeof promoCodeValidationSchema>;

export const promoCodeValidationResponseSchema = z.object({
    valid: z.boolean(),
    promo_code: promoCodeSchema.optional(),
    validated_total_amount: z.number().optional(),
    discount_amount: z.number().optional(),
    final_amount: z.number().optional(),
    error: z.string().optional(),
});

export type PromoCodeValidationResponse = z.infer<typeof promoCodeValidationResponseSchema>;
