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
    deposit_enabled: z.boolean().optional(),
    deposit_percentage: z.coerce.number().nullable().optional(),
    tournament_registration_admin_email: z.string().nullable().optional(),
    send_registration_alerts_to_global_recipient: z.boolean().optional(),
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
    deposit_enabled: z.boolean().optional(),
    deposit_percentage: z.number().min(0).max(100).optional(),
    tournament_registration_admin_email: z.union([z.literal(""), z.string().email()]).optional(),
    send_registration_alerts_to_global_recipient: z.boolean().optional(),
}).refine((data) => data.closing_hour > data.opening_hour, {
    message: "Closing hour must be after opening hour",
    path: ["closing_hour"],
}).refine((data) => !data.deposit_enabled || (data.deposit_percentage ?? 0) > 0, {
    message: "Deposit percentage must be greater than 0 when deposit is enabled",
    path: ["deposit_percentage"],
});

export type SettingFormData = z.input<typeof settingFormSchema>;
