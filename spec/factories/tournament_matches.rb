FactoryBot.define do
  factory :tournament_match do
    tournament
    round_number { 1 }
    match_number { 1 }
    team1 { association(:tournament_team, tournament: tournament) }
    team2 { association(:tournament_team, tournament: tournament) }
    winner { nil }
    court { nil }
    status { :pending }
    scheduled_time { nil }
    score { {} }
  end
end
