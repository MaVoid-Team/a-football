class TournamentMatchSerializer
  include JSONAPI::Serializer

  attributes :id, :tournament_id, :round_number, :match_number,
             :team1_id, :team2_id, :winner_id, :court_id,
             :status, :scheduled_time, :score, :schedule_locked,
             :schedule_lock_reason, :created_at, :updated_at

  attribute :team1_name do |match|
    match.team1&.name
  end

  attribute :team2_name do |match|
    match.team2&.name
  end

  attribute :winner_name do |match|
    match.winner&.name
  end
end
