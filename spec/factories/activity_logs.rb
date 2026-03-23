FactoryBot.define do
  factory :activity_log do
    association :branch
    association :actor_admin, factory: :admin
    player { nil }
    reference { nil }
    activity_type { "booking" }
    metadata { {} }

    trait :with_user_player do
      association :player, factory: :user
    end

    trait :with_tournament_player do
      association :player, factory: :tournament_player
    end
  end
end
