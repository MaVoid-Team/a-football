import { z } from "zod";

export const tournamentTypeEnum = z.enum(["knockout", "round_robin", "group_knockout"]);
export const tournamentStatusEnum = z.enum(["draft", "open", "full", "ongoing", "completed"]);

export const tournamentSchema = z.object({
    id: z.string(),
    branch_id: z.number(),
    name: z.string(),
    description: z.string().nullable().optional(),
    tournament_type: tournamentTypeEnum,
    status: tournamentStatusEnum,
    max_players: z.number().nullable().optional(),
    max_teams: z.number().nullable().optional(),
    start_date: z.string(),
    end_date: z.string().nullable().optional(),
    registration_deadline: z.string(),
    match_duration_minutes: z.number(),
    manual_seeding: z.boolean().optional(),
    points_win: z.number().optional(),
    points_loss: z.number().optional(),
    bracket_data: z.record(z.string(), z.any()).optional(),
    approved_registrations_count: z.number().optional(),
    registration_open: z.boolean().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export type Tournament = z.infer<typeof tournamentSchema>;

export const tournamentCreateSchema = z.object({
    branch_id: z.number().min(1),
    name: z.string().min(2),
    description: z.string().optional(),
    tournament_type: tournamentTypeEnum,
    status: z.enum(["draft", "open"]).optional(),
    max_players: z.number().int().positive().optional(),
    max_teams: z.number().int().positive().optional(),
    start_date: z.string().min(1),
    end_date: z.string().optional(),
    registration_deadline: z.string().min(1),
    match_duration_minutes: z.number().int().positive().default(60),
    manual_seeding: z.boolean().optional(),
    points_win: z.number().int().optional(),
    points_loss: z.number().int().optional(),
});

export type TournamentCreateData = z.infer<typeof tournamentCreateSchema>;

export const tournamentRegistrationSchema = z.object({
    name: z.string().min(2),
    phone: z.string().min(8),
    email: z.union([z.literal(""), z.string().email()]).optional(),
    user_id: z.number().optional(),
    skill_level: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
});

export type TournamentRegistrationData = z.infer<typeof tournamentRegistrationSchema>;

export const adminTournamentRegistrationSchema = z.object({
    id: z.string(),
    tournament_id: z.number(),
    player_id: z.number(),
    team_id: z.number().nullable().optional(),
    approved_by_id: z.number().nullable().optional(),
    status: z.enum(["pending", "approved", "rejected", "cancelled"]),
    refund_status: z.enum(["none", "eligible", "processed"]).optional(),
    notes: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string().optional(),
    player_name: z.string().nullable().optional(),
    player_phone: z.string().nullable().optional(),
    player_email: z.string().nullable().optional(),
    player_skill_level: z.enum(["beginner", "intermediate", "advanced"]).nullable().optional(),
});

export type AdminTournamentRegistration = z.infer<typeof adminTournamentRegistrationSchema>;

export const tournamentMatchSchema = z.object({
    id: z.string(),
    tournament_id: z.number(),
    round_number: z.number(),
    match_number: z.number(),
    team1_id: z.number().nullable().optional(),
    team1_name: z.string().nullable().optional(),
    team2_id: z.number().nullable().optional(),
    team2_name: z.string().nullable().optional(),
    winner_id: z.number().nullable().optional(),
    winner_name: z.string().nullable().optional(),
    court_id: z.number().nullable().optional(),
    status: z.enum(["pending", "scheduled", "ongoing", "completed"]),
    scheduled_time: z.string().nullable().optional(),
    score: z.record(z.string(), z.any()).optional(),
    schedule_locked: z.boolean().optional(),
    schedule_lock_reason: z.string().nullable().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export type TournamentMatch = z.infer<typeof tournamentMatchSchema>;

export const tournamentAutoScheduleSchema = z.object({
    start_time: z.string().min(1),
    court_ids: z.array(z.number()).min(1),
    override_locked: z.boolean().optional(),
});

export type TournamentAutoScheduleData = z.infer<typeof tournamentAutoScheduleSchema>;

export const tournamentMatchScheduleSchema = z.object({
    court_id: z.number().int().positive(),
    scheduled_time: z.string().min(1),
    override: z.boolean().optional(),
});

export type TournamentMatchScheduleData = z.infer<typeof tournamentMatchScheduleSchema>;

export const tournamentMatchLockSchema = z.object({
    locked: z.boolean(),
    reason: z.string().optional(),
});

export type TournamentMatchLockData = z.infer<typeof tournamentMatchLockSchema>;
