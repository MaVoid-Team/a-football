FactoryBot.define do
  factory :tournament_team do
    tournament
    player1 { association(:tournament_player, tournament: tournament) }
    player2 { nil }
    name { "Team #{Faker::Number.number(digits: 3)}" }
    status { :active }
  end
end
