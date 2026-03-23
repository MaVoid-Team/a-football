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

      remaining_ids = schedulable_matches.map(&:id)
      return failure("no_schedulable_matches", "There are no ready matches left to auto-schedule") if remaining_ids.empty?

      scheduled_matches = []
      slot_time = @start_time
      max_slots = 200

      max_slots.times do
        break if remaining_ids.empty?

        scheduled_in_slot = schedule_slot(remaining_ids, slot_time)
        scheduled_matches.concat(scheduled_in_slot)

        remaining_ids -= scheduled_in_slot.map(&:id)
        slot_time += duration.minutes
      end

      return failure("no_schedulable_matches", "There are no ready matches left to auto-schedule") if scheduled_matches.empty?
      return failure("unable_to_schedule", "Unable to schedule all matches with given constraints") if remaining_ids.any?

      ServiceResult.success(scheduled_matches)
    end

    private

    def schedulable_matches
      @tournament.tournament_matches
                 .where(status: :pending)
                 .order(:round_number, :match_number)
                 .reject { |match| match.schedule_locked? && !@override_locked }
                 .select { |match| match.team1_id.present? && match.team2_id.present? }
    end

    def schedule_slot(remaining_ids, slot_time)
      scheduled = []

      @court_ids.each do |court_id|
        match = next_schedulable_match(remaining_ids, slot_time, court_id)
        next if match.blank?

        result = MatchScheduler.new(
          match: match,
          court_id: court_id,
          scheduled_time: slot_time,
          manual_override: false,
          override_locked: @override_locked
        ).call

        scheduled << result.data if result.success?
      end

      scheduled
    end

    def next_schedulable_match(remaining_ids, slot_time, court_id)
      # Keep deterministic ordering but allow matches from any round to be selected.
      candidate_matches(remaining_ids).find do |match|
        schedulable_at_slot?(match, slot_time, court_id)
      end
    end

    def candidate_matches(remaining_ids)
      TournamentMatch.where(id: remaining_ids)
                     .where(status: :pending)
                     .order(:round_number, :match_number)
    end

    def schedulable_at_slot?(match, slot_time, court_id)
      return false if match.team1_id.blank? || match.team2_id.blank?
      return false if match.schedule_locked? && !@override_locked

      result = MatchScheduler.new(
        match: match,
        court_id: court_id,
        scheduled_time: slot_time,
        manual_override: false,
        override_locked: @override_locked,
        dry_run: true
      ).call

      result.success?
    end

    def failure(code, message)
      ServiceResult.failure(message, error_codes: [code])
    end

    def duration
      @tournament.match_duration_minutes || 60
    end
  end
end
