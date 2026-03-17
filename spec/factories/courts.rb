FactoryBot.define do
  factory :court do
    branch
    name { "Court #{Faker::Alphanumeric.alpha(number: 3).upcase}" }
    price_per_hour { Faker::Commerce.price(range: 50..300) }
    active { true }
  end
end
