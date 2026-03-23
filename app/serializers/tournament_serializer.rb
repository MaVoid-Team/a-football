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

  attribute :entry_mode do |tournament|
    tournament.max_teams.present? ? "team" : "player"
  end

  attribute :capacity_total do |tournament|
    tournament.max_teams.presence || tournament.max_players
  end

  attribute :capacity_remaining do |tournament|
    total = tournament.max_teams.presence || tournament.max_players
    next nil if total.blank?

    current =
      if tournament.max_teams.present?
        [(tournament.tournament_registrations.approved.count / 2), tournament.tournament_teams.active.count].max
      else
        tournament.tournament_registrations.approved.count
      end

    [total - current, 0].max
  end
end
