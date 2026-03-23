require "ostruct"

module Crm
  class PlayerScoreUpdater
    def initialize(player:, branch_id: nil)
      @player = player
      @branch_id = branch_id
    end

    def call
      setting = scoring_setting

      activity_score = compute_activity_score
      frequency_score = [@player.total_bookings.to_i * 10, 100].min
      engagement_score = [((@player.total_matches.to_i * 12) + (@player.total_tournaments.to_i * 15) + (@player.total_bookings.to_i * 5)), 100].min

      reliability_penalty = (@player.no_show_count.to_i * 20) + (@player.cancellation_count.to_i * 10)
      reliability_score = [100 - reliability_penalty, 0].max

      total_score = weighted_total(
        setting,
        activity_score: activity_score,
        frequency_score: frequency_score,
        engagement_score: engagement_score,
        reliability_score: reliability_score
      )

      now = Time.current

      PlayerScore.upsert(
        {
          player_type: @player.class.name,
          player_id: @player.id,
          branch_id: @branch_id,
          activity_score: activity_score,
          frequency_score: frequency_score,
          engagement_score: engagement_score,
          reliability_score: reliability_score,
          total_score: total_score,
          calculated_at: now,
          created_at: now,
          updated_at: now
        },
        unique_by: %i[player_type player_id]
      )

      Crm::BehaviorFlagUpdater.new(player: @player, branch_id: @branch_id, total_score: total_score).call

      total_score
    end

    private

    def scoring_setting
      return OpenStruct.new(activity_weight: 30, frequency_weight: 25, engagement_weight: 25, reliability_weight: 20) if @branch_id.blank?

      CrmScoringSetting.find_or_create_by!(branch_id: @branch_id)
    end

    def compute_activity_score
      return 0 if @player.last_activity_date.blank?

      days = ((Time.current - @player.last_activity_date) / 1.day).floor
      return 100 if days <= 2
      return 80 if days <= 7
      return 60 if days <= 14
      return 40 if days <= 30

      15
    end

    def weighted_total(setting, activity_score:, frequency_score:, engagement_score:, reliability_score:)
      total_weight = setting.activity_weight + setting.frequency_weight + setting.engagement_weight + setting.reliability_weight
      return 0 if total_weight <= 0

      weighted =
        (activity_score * setting.activity_weight) +
        (frequency_score * setting.frequency_weight) +
        (engagement_score * setting.engagement_weight) +
        (reliability_score * setting.reliability_weight)

      (weighted.to_f / total_weight).round
    end
  end
end
