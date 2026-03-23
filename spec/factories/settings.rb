FactoryBot.define do
  factory :setting do
    branch
    whatsapp_number { Faker::PhoneNumber.phone_number.gsub(/\D/, "") }
    contact_email { Faker::Internet.email }
    contact_phone { Faker::PhoneNumber.phone_number }
    opening_hour { 8 }
    closing_hour { 23 }
    deposit_enabled { false }
    deposit_percentage { 0 }
  end
end
