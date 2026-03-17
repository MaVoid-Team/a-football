FactoryBot.define do
  factory :event_booking do
    event
    user_name { Faker::Name.name }
    user_phone { Faker::PhoneNumber.phone_number }
    status { :confirmed }
  end
end
