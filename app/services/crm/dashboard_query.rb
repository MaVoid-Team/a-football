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
      retention_rate = total_players.zero? ? 0 : ((active_count.to_f / total_players) * 100).round(1)

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

      insight_cards = build_insight_cards(players_data)
      active_inactive_trend = build_activity_trend(players_data)
      most_inactive_segment = find_most_inactive_segment
      booking_frequency_distribution = booking_distribution(players_data)

      {
        total_players: total_players,
        active_players: active_count,
        inactive_players: inactive_count,
        retention_rate: retention_rate,
        insight_cards: insight_cards,
        active_inactive_trend: active_inactive_trend,
        most_inactive_segment: most_inactive_segment,
        booking_frequency_distribution: booking_frequency_distribution,
        top_players: top_players,
        recent_activity: recent_activity
      }
    end

    private

    def scoped_activity
      return ActivityLog.includes(:player) if @admin.super_admin?

      ActivityLog.includes(:player).where(branch_id: @admin.branch_id)
    end

    def build_insight_cards(players_data)
      now = Time.current
      inactive_14 = players_data.count do |player|
        player[:last_activity_date].blank? || player[:last_activity_date] <= 14.days.ago
      end
      highly_active_week = players_data.count do |player|
        player[:last_activity_date].present? && player[:last_activity_date] >= 7.days.ago && player[:total_bookings].to_i >= 2
      end

      pending_actions = scoped_action_items.where(status: "pending").count

      [
        {
          key: "inactive_14_days",
          count: inactive_14,
          message: "#{inactive_14} players have not played in 14 days",
          action_path: "/crm/actions?status=pending"
        },
        {
          key: "highly_active_week",
          count: highly_active_week,
          message: "#{highly_active_week} players are highly active this week",
          action_path: "/crm/players?status=active"
        },
        {
          key: "pending_suggestions",
          count: pending_actions,
          message: "#{pending_actions} suggested actions are waiting in Action Center",
          action_path: "/crm/actions?status=pending"
        }
      ]
    end

    def build_activity_trend(players_data)
      (0..29).to_a.reverse.map do |offset|
        day = offset.days.ago.to_date
        active = players_data.count { |player| player[:last_activity_date].present? && player[:last_activity_date].to_date >= day }

        {
          date: day,
          active: active,
          inactive: players_data.size - active
        }
      end
    end

    def find_most_inactive_segment
      segment_scope = @admin.super_admin? ? Segment.active_only : Segment.active_only.for_branch(@admin.branch_id)
      segment_ids = segment_scope.pluck(:id)
      return nil if segment_ids.empty?

      memberships = SegmentMembership.where(segment_id: segment_ids)
      membership_counts = memberships.group(:segment_id).count
      return nil if membership_counts.empty?

      inactive_counts = membership_counts.transform_values do |_count|
        0
      end

      memberships.find_each do |membership|
        player = membership.player_type.constantize.find_by(id: membership.player_id)
        next if player.blank?
        next unless player.last_activity_date.blank? || player.last_activity_date <= 14.days.ago

        inactive_counts[membership.segment_id] = inactive_counts[membership.segment_id].to_i + 1
      end

      segment_id, count = inactive_counts.max_by { |_segment_id, value| value }
      return nil if segment_id.blank?

      segment = Segment.find_by(id: segment_id)
      return nil if segment.blank?

      {
        id: segment.id,
        name: segment.name,
        inactive_count: count
      }
    end

    def booking_distribution(players_data)
      {
        low: players_data.count { |player| player[:total_bookings].to_i <= 1 },
        medium: players_data.count { |player| player[:total_bookings].to_i.between?(2, 4) },
        high: players_data.count { |player| player[:total_bookings].to_i >= 5 }
      }
    end

    def scoped_action_items
      return ActionItem.all if @admin.super_admin?

      ActionItem.where(branch_id: @admin.branch_id)
    end
  end
end
