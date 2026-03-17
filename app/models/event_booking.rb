class EventBooking < ApplicationRecord
  belongs_to :event

  enum :status, { confirmed: 0, cancelled: 1 }

  validates :user_name, presence: true
  validates :user_phone, presence: true
end
