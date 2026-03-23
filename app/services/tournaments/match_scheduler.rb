module Tournaments
  class MatchScheduler
    def initialize(match:, court_id:, scheduled_time:, manual_override: false, override_locked: false)
      @match = match
      @tournament = match.tournament
      @court_id = court_id.to_i
      @scheduled_time = Time.zone.parse(scheduled_time.to_s)
      @manual_override = manual_override
      @override_locked = override_locked
    end

    def call
      return failure("invalid_time", "Scheduled time is invalid") if @scheduled_time.blank?
      return failure("locked_match", "Match scheduling is locked") if @match.schedule_locked? && !@manual_override && !@override_locked

      unless @manual_override
        return failure("invalid_court", "Court does not belong to tournament branch") unless valid_branch_court?
        return failure("blocked_slot", "Court is blocked for that time") if blocked_slot?
        return failure("court_conflict", "Court has another match at this time") if court_conflict?
        return failure("team_back_to_back", "Team cannot play back-to-back matches") if back_to_back_conflict?
      end

      @match.update!(
        court_id: @court_id,
        scheduled_time: @scheduled_time,
        status: :scheduled
      )

      Users::NotificationPublisher.match_scheduled(@match)

      ServiceResult.success(@match)
    rescue ActiveRecord::RecordInvalid => e
      ServiceResult.failure(e.record.errors.full_messages, error_codes: ["schedule_invalid"])
    end

    private

    def valid_branch_court?
      Court.exists?(id: @court_id, branch_id: @tournament.branch_id)
    end

    def blocked_slot?
      date = @scheduled_time.to_date
      start_time = @scheduled_time.strftime("%H:%M")
      end_time = (@scheduled_time + duration.minutes).strftime("%H:%M")

      BlockedSlot.overlapping(@court_id, date, start_time, end_time).exists?
    end

    def court_conflict?
      TournamentMatch.where(court_id: @court_id)
                     .where.not(id: @match.id)
                     .where.not(scheduled_time: nil)
                     .any? { |m| overlaps?(m.scheduled_time, @scheduled_time) }
    end

    def back_to_back_conflict?
      team_ids = [@match.team1_id, @match.team2_id].compact
      return false if team_ids.empty?

      @tournament.tournament_matches
                 .where.not(id: @match.id)
                 .where.not(scheduled_time: nil)
                 .where("team1_id IN (:ids) OR team2_id IN (:ids)", ids: team_ids)
                 .any? do |existing|
        existing_start = existing.scheduled_time
        existing_end = existing_start + duration.minutes
        candidate_end = @scheduled_time + duration.minutes

        overlap = @scheduled_time < existing_end && candidate_end > existing_start
        too_close_after = @scheduled_time >= existing_end && (@scheduled_time - existing_end) < duration.minutes
        too_close_before = existing_start >= candidate_end && (existing_start - candidate_end) < duration.minutes

        overlap || too_close_after || too_close_before
      end
    end

    def overlaps?(existing_start, candidate_start)
      existing_end = existing_start + duration.minutes
      candidate_end = candidate_start + duration.minutes
      candidate_start < existing_end && candidate_end > existing_start
    end

    def duration
      @tournament.match_duration_minutes || 60
    end

    def failure(code, message)
      ServiceResult.failure(message, error_codes: [code])
    end
  end
end
