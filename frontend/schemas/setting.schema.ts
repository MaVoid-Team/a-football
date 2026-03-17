import { z } from "zod";

export const settingSchema = z.object({
    id: z.string(),
    branch_id: z.number(),
    whatsapp_number: z.string().nullable().optional(),
    contact_email: z.string().nullable().optional(),
    contact_phone: z.string().nullable().optional(),
    opening_hour: z.number(),
    closing_hour: z.number(),
    booking_terms: z.string().nullable().optional(),
    payment_number: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
});

export type Setting = z.infer<typeof settingSchema>;

export const settingFormSchema = z.object({
    branch_id: z.number().optional(), // super admin can specify
    whatsapp_number: z.string().optional(),
    contact_email: z.union([z.literal(""), z.string().email()]).optional(),
    contact_phone: z.string().optional(),
    opening_hour: z.number().min(0).max(23),
    closing_hour: z.number().min(0).max(24),
    booking_terms: z.string().optional(),
    payment_number: z.string().optional(),
}).refine((data) => data.closing_hour > data.opening_hour, {
    message: "Closing hour must be after opening hour",
    path: ["closing_hour"],
});

export type SettingFormData = z.infer<typeof settingFormSchema>;
