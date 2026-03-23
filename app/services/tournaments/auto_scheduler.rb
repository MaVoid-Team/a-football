module Tournaments
  class AutoScheduler
    def initialize(tournament:, start_time:, court_ids:, override_locked: false)
      @tournament = tournament
      @start_time = Time.zone.parse(start_time.to_s)
      @court_ids = Array(court_ids).map(&:to_i).uniq
      @override_locked = override_locked
    end

    def call
      return failure("invalid_start_time", "Start time is invalid") if @start_time.blank?
      return failure("missing_courts", "At least one court is required") if @court_ids.empty?

      pending_matches = @tournament.tournament_matches
                                 .where(status: %i[pending scheduled])
                                 .order(:round_number, :match_number)

      scheduled_matches = []
      next_time = @start_time

      pending_matches.each do |match|
        next if match.schedule_locked? && !@override_locked
        next if match.team1_id.blank? || match.team2_id.blank?

        scheduled = schedule_one_match(match, next_time)
        return scheduled if scheduled.failure?

        scheduled_matches << scheduled.data
        next_time += @tournament.match_duration_minutes.minutes
      end

      ServiceResult.success(scheduled_matches)
    end

    private

    def schedule_one_match(match, seed_time)
      max_attempts = 200
      attempt = 0
      time_cursor = seed_time

      while attempt < max_attempts
        @court_ids.each do |court_id|
          result = MatchScheduler.new(
            match: match,
            court_id: court_id,
            scheduled_time: time_cursor,
            manual_override: false,
            override_locked: @override_locked
          ).call

          return result if result.success?
        end

        time_cursor += @tournament.match_duration_minutes.minutes
        attempt += 1
      end

      failure("unable_to_schedule", "Unable to schedule all matches with given constraints")
    end

    def failure(code, message)
      ServiceResult.failure(message, error_codes: [code])
    end
  end
end
