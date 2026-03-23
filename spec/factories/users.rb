FactoryBot.define do
  factory :user do
    name { Faker::Name.name }
    phone { "+2011#{rand(10000000..99999999)}" }
    email { Faker::Internet.unique.email }
    password { "password123" }
    skill_level { :intermediate }
  end
end
