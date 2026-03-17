FactoryBot.define do
  factory :booking do
    branch
    court
    user_name { Faker::Name.name }
    user_phone { Faker::PhoneNumber.phone_number }
    date { Date.tomorrow }
    start_time { "10:00" }
    end_time { "11:00" }
    hours { 1 }
    total_price { 150.00 }
    status { :confirmed }
    payment_status { :pending }

    after(:build) do |booking|
      booking.branch = booking.court.branch if booking.court
    end
  end
end
