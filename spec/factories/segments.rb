FactoryBot.define do
  factory :segment do
    sequence(:name) { |n| "segment_#{n}" }
    conditions do
      {
        "operator" => "all",
        "rules" => [
          { "field" => "total_bookings", "op" => "gte", "value" => 3 }
        ]
      }
    end
    active { true }
    branch { nil }

    trait :for_branch do
      association :branch
    end

    trait :inactive do
      active { false }
    end
  end
end
