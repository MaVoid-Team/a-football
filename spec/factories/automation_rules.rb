FactoryBot.define do
  factory :automation_rule do
    sequence(:name) { |n| "rule_#{n}" }
    trigger_type { "booking_created" }
    conditions do
      {
        "operator" => "all",
        "rules" => [
          { "field" => "total_bookings", "op" => "gte", "value" => 1 }
        ]
      }
    end
    action_type { "suggest_whatsapp" }
    is_active { true }
    branch { nil }
    created_by_admin { nil }
    template { nil }
  end
end
