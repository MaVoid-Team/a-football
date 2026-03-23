FactoryBot.define do
  factory :tournament_player do
    tournament
    name { Faker::Name.name }
    phone { "+2010#{rand(10000000..99999999)}" }
    skill_level { :intermediate }
    status { :pending }
  end
end
