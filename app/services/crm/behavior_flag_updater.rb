module Crm
  class BehaviorFlagUpdater
    def initialize(player:, branch_id: nil, total_score: nil)
      @player = player
      @branch_id = branch_id
      @total_score = total_score
    end

    def call
      now = Time.current
      active_flags = build_flags

      BehaviorFlag.for_player(@player.class.name, @player.id).active_only.update_all(active: false, updated_at: now)

      active_flags.each do |flag_type, reason|
        BehaviorFlag.create!(
          player_type: @player.class.name,
          player_id: @player.id,
          branch_id: @branch_id,
          flag_type: flag_type,
          reason: reason,
          active: true,
          assigned_at: now
        )
      end

      active_flags.keys
    end

    private

    def build_flags
      flags = {}
      days_since_activity = @player.last_activity_date.present? ? ((Time.current - @player.last_activity_date) / 1.day).floor : 1_000_000

      if days_since_activity >= 14
        flags["inactive"] = "No activity for #{days_since_activity} days"
      end

      if (@total_score || 0) >= 75 && @player.total_bookings.to_i >= 5
        flags["high_value"] = "High score and frequent bookings"
      end

      if days_since_activity >= 14 && @player.total_bookings.to_i >= 3
        flags["at_risk"] = "Previously active player has become inactive"
      end

      if @player.no_show_count.to_i >= 2 || @player.cancellation_count.to_i >= 3
        flags["unreliable"] = "High no-show/cancellation count"
      end

      flags
    end
  end
end
