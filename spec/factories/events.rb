FactoryBot.define do
  factory :event do
    branch
    title { Faker::Esport.event }
    description { Faker::Lorem.paragraph }
    start_date { 1.month.from_now }
    participation_price { Faker::Commerce.price(range: 50..500) }
    max_participants { rand(8..64) }
  end
end
