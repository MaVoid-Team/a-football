FactoryBot.define do
  factory :tournament do
    branch
    created_by { association(:admin, branch: branch) }
    name { "Spring Cup" }
    tournament_type { :knockout }
    status { :open }
    max_players { 16 }
    max_teams { nil }
    start_date { 7.days.from_now }
    end_date { 9.days.from_now }
    registration_deadline { 3.days.from_now }
    match_duration_minutes { 60 }
    points_win { 3 }
    points_loss { 0 }
    bracket_data { {} }
    manual_seeding { false }
    description { "Tournament description" }
  end
end
