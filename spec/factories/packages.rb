FactoryBot.define do
  factory :package do
    branch { nil }
    title { Faker::Commerce.product_name }
    description { Faker::Lorem.sentence }
    price { Faker::Commerce.price(range: 100..5000) }
  end
end
