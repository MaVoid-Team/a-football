import { z } from "zod";

export const adminSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.enum(["super_admin", "branch_admin"]),
  branch_id: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Admin = z.infer<typeof adminSchema>;

// ── Static schemas kept only for type inference ───────────────────────────────

const _adminFormSchema = z
  .object({
    branch_id: z.number().nullable().optional(),
    email: z.string().email(),
    password: z.string().min(8),
    password_confirmation: z.string(),
    role: z.enum(["super_admin", "branch_admin"]),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
  });

export type AdminFormData = z.infer<typeof _adminFormSchema>;

const _adminUpdateSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(["super_admin", "branch_admin"]).optional(),
  branch_id: z.number().nullable().optional(),
});

export type AdminUpdateData = z.infer<typeof _adminUpdateSchema>;

// ── Runtime schema factories with translated error messages ───────────────────

export interface AdminFormMessages {
  invalidEmail: string;
  passwordMinLength: string;
  passwordsDoNotMatch: string;
}

export const createAdminFormSchema = (msgs: AdminFormMessages) =>
  z
    .object({
      branch_id: z.number().nullable().optional(),
      email: z.string().email(msgs.invalidEmail),
      password: z.string().min(8, msgs.passwordMinLength),
      password_confirmation: z.string(),
      role: z.enum(["super_admin", "branch_admin"]),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: msgs.passwordsDoNotMatch,
      path: ["password_confirmation"],
    });

export const createAdminUpdateSchema = (
  msgs: Pick<AdminFormMessages, "invalidEmail">,
) =>
  z.object({
    email: z.string().email(msgs.invalidEmail).optional(),
    role: z.enum(["super_admin", "branch_admin"]).optional(),
    branch_id: z.number().nullable().optional(),
  });
