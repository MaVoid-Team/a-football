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
  tags: string[];
}

export interface CrmActivityItem {
  id: number;
  activity_type: string;
  reference_type?: string | null;
  reference_id?: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CrmPlayerProfile extends CrmPlayerSummary {
  activities: CrmActivityItem[];
}

export interface CrmSegment {
  id: number;
  name: string;
  conditions: Record<string, unknown>;
  active: boolean;
  branch_id?: number | null;
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
