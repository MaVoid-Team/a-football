FactoryBot.define do
  factory :tournament_registration do
    tournament
    player { association(:tournament_player, tournament: tournament) }
    team { nil }
    approved_by { nil }
    status { :pending }
    refund_status { :none }
    notes { nil }
  end
end
