FactoryBot.define do
  factory :court_hourly_rate do
    court
    start_hour { 8 }
    end_hour { 12 }
    price_per_hour { 120.00 }
    active { true }
  end
end
