module Crm
  class DashboardQuery
    def initialize(admin:)
      @admin = admin
    end

    def call
      players_data = Crm::PlayersQuery.new(admin: @admin, params: { page: 1, per_page: 100_000 }).call[:data]

      total_players = players_data.size
      active_count = players_data.count do |player|
        player[:last_activity_date].present? && player[:last_activity_date] >= 7.days.ago
      end
      inactive_count = total_players - active_count

      top_players = players_data
                    .sort_by { |player| [player[:total_bookings], player[:total_matches]] }
                    .reverse
                    .first(10)

      recent_activity = scoped_activity.recent_first.limit(20).map do |activity|
        {
          id: activity.id,
          player_type: activity.player_type,
          player_id: activity.player_id,
          player_name: activity.player&.name,
          activity_type: activity.activity_type,
          reference_type: activity.reference_type,
          reference_id: activity.reference_id,
          metadata: activity.metadata,
          created_at: activity.created_at
        }
      end

      {
        total_players: total_players,
        active_players: active_count,
        inactive_players: inactive_count,
        top_players: top_players,
        recent_activity: recent_activity
      }
    end

    private

    def scoped_activity
      return ActivityLog.includes(:player) if @admin.super_admin?

      ActivityLog.includes(:player).where(branch_id: @admin.branch_id)
    end
  end
end
