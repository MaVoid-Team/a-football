FactoryBot.define do
  factory :booking do
    branch
    court
    user { nil }
    user_name { Faker::Name.name }
    user_phone { Faker::PhoneNumber.phone_number }
    date { Date.tomorrow }
    start_time { "10:00" }
    end_time { "11:00" }
    hours { 1 }
    total_price { 150.00 }
    payment_option { :full }
    deposit_percentage_snapshot { 0 }
    amount_due_now { total_price }
    amount_remaining { 0 }
    status { :confirmed }
    payment_status { :pending }

    after(:build) do |booking|
      booking.branch = booking.court.branch if booking.court
    end
  end
end
