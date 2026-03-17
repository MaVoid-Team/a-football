class Payment < ApplicationRecord
  belongs_to :booking

  validates :amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :status, presence: true

  scope :for_booking, ->(booking_id) { where(booking_id: booking_id) }
end
