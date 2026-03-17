FactoryBot.define do
  factory :blocked_slot do
    branch
    court
    date { Date.tomorrow }
    start_time { "08:00" }
    end_time { "09:00" }
    reason { "Maintenance" }

    after(:build) do |slot|
      slot.branch = slot.court.branch if slot.court
    end
  end
end
