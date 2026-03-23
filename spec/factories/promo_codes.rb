FactoryBot.define do
  factory :promo_code do
    association :branch
    sequence(:code) { |n| "PROMO#{n}" }
    description { "Test promo code" }
    discount_percentage { 10.0 }
    starts_at { 1.day.ago }
    expires_at { 1.week.from_now }
    active { true }
    used_count { 0 }

    trait :fixed_discount do
      discount_percentage { nil }
      discount_amount { 25.0 }
    end

    trait :with_minimum_amount do
      minimum_amount { 120.0 }
    end

    trait :at_usage_limit do
      usage_limit { 1 }
      used_count { 1 }
    end
  end
end
