class BookingSlot < ApplicationRecord
  belongs_to :booking

  validates :start_time, presence: true
  validates :end_time, presence: true
  validate :end_after_start

  def end_after_start
    if end_time <= start_time
      errors.add(:end_time, "must be after start time")
    end
  end
end
