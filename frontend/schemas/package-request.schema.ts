import { z } from "zod";

export const packageRequestSchema = z.object({
    id: z.string(),
    package_id: z.string(),
    branch_id: z.number().nullable(),
    customer_name: z.string(),
    customer_email: z.string().email(),
    customer_phone: z.string(),
    special_needs: z.string(),
    status: z.enum(["pending", "reviewed", "contacted", "completed", "archived"]),
    created_at: z.string(),
    updated_at: z.string(),
});

export type PackageRequest = z.infer<typeof packageRequestSchema>;

export const packageRequestFormSchema = z.object({
    package_id: z.string().min(1, "Package is required"),
    branch_id: z.number().nullable().optional(),
    customer_name: z.string().min(1, "Name is required"),
    customer_email: z.string().email("Invalid email address"),
    customer_phone: z.string().min(10, "Phone number is required"),
    special_needs: z.string().min(10, "Please tell us about your needs in detail"),
});

export type PackageRequestFormData = z.infer<typeof packageRequestFormSchema>;
