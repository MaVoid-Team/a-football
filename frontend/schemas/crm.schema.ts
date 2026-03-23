export type CrmPlayerType = "User" | "TournamentPlayer";

export interface CrmPlayerSummary {
  key: string;
  player_type: CrmPlayerType;
  player_id: number;
  name: string;
  phone: string;
  email?: string | null;
  skill_level?: string | null;
  last_activity_date?: string | null;
  total_bookings: number;
  total_matches: number;
  total_tournaments: number;
  no_show_count?: number;
  cancellation_count?: number;
  player_score?: number;
  behavior_flags?: string[];
  tags: string[];
}

export interface CrmActivityItem {
  id: number;
  activity_type: string;
  reference_type?: string | null;
  reference_id?: number | null;
  metadata: Record<string, unknown>;
  actor_admin_name?: string | null;
  created_at: string;
}

export interface CrmPlayerProfile extends CrmPlayerSummary {
  score_breakdown?: {
    engagement_score: number;
    activity_score: number;
    frequency_score: number;
    reliability_score: number;
  };
  activities_meta?: {
    page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
    has_more: boolean;
  };
  activities: CrmActivityItem[];
}

export interface CrmSegment {
  id: number;
  name: string;
  conditions: Record<string, unknown>;
  active: boolean;
  auto_update?: boolean;
  branch_id?: number | null;
}

export interface CrmAutomationRule {
  id: number;
  name: string;
  trigger_type: string;
  conditions: Record<string, unknown>;
  action_type: string;
  template_id?: number | null;
  is_active: boolean;
  branch_id?: number | null;
  created_by_admin_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CrmActionItem {
  id: number;
  player_type: CrmPlayerType;
  player_id: number;
  reason: string;
  status: "pending" | "completed" | "ignored";
  automation_rule_id?: number | null;
  suggested_template_id?: number | null;
  acted_by_admin_id?: number | null;
  completed_at?: string | null;
  ignored_at?: string | null;
  created_at: string;
}

export interface CrmScoringSetting {
  id: number;
  branch_id: number;
  activity_weight: number;
  frequency_weight: number;
  engagement_weight: number;
  reliability_weight: number;
  updated_at: string;
}

export interface CrmMessageTemplate {
  id: number;
  name: string;
  content: string;
  whatsapp_number: string;
  active: boolean;
  branch_id?: number | null;
}

export interface CrmDashboardData {
  total_players: number;
  active_players: number;
  inactive_players: number;
  retention_rate?: number;
  insight_cards?: Array<{
    key: string;
    count: number;
    message: string;
    action_path?: string | null;
  }>;
  active_inactive_trend?: Array<{
    date: string;
    active: number;
    inactive: number;
  }>;
  most_inactive_segment?: {
    id: number;
    name: string;
    inactive_count: number;
  } | null;
  booking_frequency_distribution?: {
    low: number;
    medium: number;
    high: number;
  };
  top_players: CrmPlayerSummary[];
  recent_activity: Array<{
    id: number;
    player_type?: string | null;
    player_id?: number | null;
    player_name?: string | null;
    activity_type: string;
    reference_type?: string | null;
    reference_id?: number | null;
    metadata: Record<string, unknown>;
    created_at: string;
  }>;
}
