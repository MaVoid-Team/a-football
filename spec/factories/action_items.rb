FactoryBot.define do
  factory :action_item do
    player_type { "User" }
    player_id { create(:user).id }
    automation_rule { nil }
    suggested_template { nil }
    branch { nil }
    reason { "Player inactive for 10 days" }
    status { "pending" }
    acted_by_admin { nil }
    completed_at { nil }
    ignored_at { nil }
  end
end
