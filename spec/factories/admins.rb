FactoryBot.define do
  factory :admin do
    email { Faker::Internet.unique.email }
    password { "password123" }
    password_confirmation { "password123" }
    role { :branch_admin }
    branch

    trait :super_admin do
      role { :super_admin }
      branch { nil }
    end

    trait :branch_admin do
      role { :branch_admin }
      branch
    end
  end
end
