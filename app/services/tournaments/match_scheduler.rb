module Tournaments
  class MatchScheduler
    def initialize(match:, court_id:, scheduled_time:, manual_override: false, override_locked: false, dry_run: false)
      @match = match
      @tournament = match.tournament
      @court_id = court_id.to_i
      @scheduled_time = Time.zone.parse(scheduled_time.to_s)
      @manual_override = manual_override
      @override_locked = override_locked
      @dry_run = dry_run
    end

    def call
      return failure("invalid_time", "Scheduled time is invalid") if @scheduled_time.blank?
      return failure("match_not_ready", "Both participants must be assigned before scheduling") if @match.team1_id.blank? || @match.team2_id.blank?
      return failure("match_completed", "Completed matches cannot be rescheduled") if @match.completed?
      return failure("locked_match", "Match scheduling is locked") if @match.schedule_locked? && !@manual_override && !@override_locked

      unless @manual_override
        return failure("invalid_court", "Court does not belong to tournament branch") unless valid_branch_court?
        return failure("blocked_slot", "Court is blocked for that time") if blocked_slot?
        return failure("court_conflict", "Court has another match at this time") if court_conflict?
        return failure("team_back_to_back", "Team already has a match at this time") if team_overlap_conflict?
      end

      return ServiceResult.success(@match) if @dry_run

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

    def team_overlap_conflict?
      team_ids = [@match.team1_id, @match.team2_id].compact
      return false if team_ids.empty?

      @tournament.tournament_matches
                 .where.not(id: @match.id)
                 .where.not(scheduled_time: nil)
                 .where("team1_id IN (:ids) OR team2_id IN (:ids)", ids: team_ids)
                 .any? do |existing|
        existing_start = existing.scheduled_time
        overlaps?(existing_start, @scheduled_time)
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
