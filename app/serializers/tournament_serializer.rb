class TournamentSerializer
  include JSONAPI::Serializer

  attributes :id, :branch_id, :name, :description, :tournament_type, :status,
             :max_players, :max_teams, :start_date, :end_date, :registration_deadline,
             :match_duration_minutes, :manual_seeding, :points_win, :points_loss,
             :bracket_data, :created_at, :updated_at

  attribute :approved_registrations_count do |tournament|
    if tournament.association(:tournament_registrations).loaded?
      tournament.tournament_registrations.count(&:approved?)
    else
      tournament.tournament_registrations.approved.count
    end
  end

  attribute :registration_open do |tournament|
    tournament.registration_open?
  end
end
