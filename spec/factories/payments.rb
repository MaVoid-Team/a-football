FactoryBot.define do
  factory :payment do
    booking
    provider { "manual" }
    status { "pending" }
    transaction_id { SecureRandom.uuid }
    amount { 150.00 }
    raw_payload { {} }
  end
end
