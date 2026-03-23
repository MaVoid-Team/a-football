import { z } from "zod";

export const bookingSlotSchema = z.object({
    start_time: z.string(),
    end_time: z.string(),
});

export type BookingSlot = z.infer<typeof bookingSlotSchema>;

export const bookingSchema = z.object({
    id: z.string(),
    branch_id: z.number(),
    court_id: z.number(),
    user_name: z.string(),
    user_phone: z.string(),
    date: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    total_price: z.string().nullable().optional(),
    original_price: z.string().nullable().optional(),
    discount_amount: z.string().nullable().optional(),
    hours: z.number().nullable().optional(),
    status: z.enum(["confirmed", "cancelled"]),
    payment_status: z.enum(["pending", "paid", "failed", "refunded"]).nullable().optional(),
    payment_option: z.enum(["full", "deposit"]).nullable().optional(),
    deposit_percentage_snapshot: z.string().nullable().optional(),
    amount_due_now: z.string().nullable().optional(),
    amount_remaining: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    admin_notes: z.string().nullable().optional(),
    promo_code_id: z.string().nullable().optional(),
    promo_code_code: z.string().nullable().optional(),
    branch_name: z.string().nullable().optional(),
    court_name: z.string().nullable().optional(),
    booking_slots: z.array(bookingSlotSchema).optional(),
    payment_screenshot_url: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
});

export type Booking = z.infer<typeof bookingSchema>;

export const bookingFormSchema = z.object({
    branch_id: z.number(),
    court_id: z.number(),
    user_name: z.string().min(1, "Name is required"),
    user_phone: z.string().min(10, "Phone number is required"),
    date: z.string().min(1, "Date is required"),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    booking_slots_attributes: z.array(z.object({
        start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
        end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    })).min(2, "Select at least two adjacent time slots (1 hour minimum)"),
    notes: z.string().optional(),
    promo_code: z.string().optional(),
    pay_deposit: z.boolean().optional(),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

export const bookingUpdateSchema = z.object({
    payment_status: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
    admin_notes: z.string().optional(),
});

export type BookingUpdateData = z.infer<typeof bookingUpdateSchema>;
