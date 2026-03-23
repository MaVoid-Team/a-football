FactoryBot.define do
  factory :user_team do
    user
    name { "Team #{Faker::Number.number(digits: 3)}" }
    teammate_name { Faker::Name.name }
    teammate_phone { "+2012#{rand(10000000..99999999)}" }
    teammate_email { Faker::Internet.email }
    teammate_skill_level { :intermediate }
  end
end
