FactoryBot.define do
  factory :segment_membership do
    segment
    player_type { "User" }
    player_id { create(:user).id }
    branch { nil }
    matched_at { Time.current }
  end
end
