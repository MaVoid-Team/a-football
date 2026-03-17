FactoryBot.define do
  factory :branch do
    name { Faker::Company.name }
    address { Faker::Address.full_address }
    timezone { "UTC" }
    active { true }
  end
end
