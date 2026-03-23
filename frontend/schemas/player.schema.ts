import { z } from "zod";

export const playerSkillLevelEnum = z.enum(["beginner", "intermediate", "advanced"]);

export const playerUserSchema = z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string(),
    email: z.string().email(),
    skill_level: playerSkillLevelEnum,
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export type PlayerUser = z.infer<typeof playerUserSchema>;

export const playerRegisterSchema = z.object({
    name: z.string().min(2),
    phone: z.string().min(8),
    email: z.string().email(),
    password: z.string().min(8),
    skill_level: playerSkillLevelEnum.default("intermediate"),
});

export type PlayerRegisterData = z.infer<typeof playerRegisterSchema>;

export const playerLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export type PlayerLoginData = z.infer<typeof playerLoginSchema>;

export const playerTeamSchema = z.object({
    id: z.string(),
    name: z.string(),
    teammate_name: z.string(),
    teammate_phone: z.string(),
    teammate_email: z.string().nullable().optional(),
    teammate_skill_level: playerSkillLevelEnum,
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export type PlayerTeam = z.infer<typeof playerTeamSchema>;

export const playerTeamFormSchema = z.object({
    name: z.string().min(2),
    teammate_name: z.string().min(2),
    teammate_phone: z.string().min(8),
    teammate_email: z.union([z.literal(""), z.string().email()]).optional(),
    teammate_skill_level: playerSkillLevelEnum.default("intermediate"),
});

export type PlayerTeamFormData = z.infer<typeof playerTeamFormSchema>;

export const playerNotificationSchema = z.object({
    id: z.string(),
    notification_type: z.string(),
    title: z.string(),
    body: z.string(),
    link_url: z.string().nullable().optional(),
    data: z.record(z.string(), z.any()).optional(),
    read_at: z.string().nullable().optional(),
    read: z.boolean().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export type PlayerNotification = z.infer<typeof playerNotificationSchema>;

export const playerParticipationSchema = z.object({
    id: z.string(),
    registration_id: z.number(),
    tournament_id: z.number(),
    tournament_name: z.string(),
    tournament_type: z.string(),
    tournament_status: z.string(),
    branch_name: z.string().nullable().optional(),
    start_date: z.string(),
    registration_status: z.string(),
    participation_status: z.string(),
    team_id: z.number().nullable().optional(),
    team_name: z.string().nullable().optional(),
    created_at: z.string(),
});

export type PlayerParticipation = z.infer<typeof playerParticipationSchema>;
