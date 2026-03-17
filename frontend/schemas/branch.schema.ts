import { z } from "zod";

export const branchSchema = z.object({
    id: z.string(),
    name: z.string(),
    address: z.string(),
    timezone: z.string(),
    active: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
});

export type Branch = z.infer<typeof branchSchema>;

export const branchFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    address: z.string().min(1, "Address is required"),
    timezone: z.string().min(1, "Timezone is required"),
    active: z.boolean(),
});

export type BranchFormData = z.infer<typeof branchFormSchema>;
