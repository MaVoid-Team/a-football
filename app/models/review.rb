class Review < ApplicationRecord
  belongs_to :booking
  belongs_to :court
  belongs_to :branch

  validates :reviewer_name, presence: true
  validates :rating, presence: true, inclusion: { in: 1..5, message: "must be between 1 and 5" }
  validates :booking_id, uniqueness: { message: "already has a review" }

  validate :booking_must_be_confirmed

  scope :for_court,  ->(court_id)  { where(court_id: court_id) }
  scope :for_branch, ->(branch_id) { where(branch_id: branch_id) }

  private

  def booking_must_be_confirmed
    return unless booking
    unless booking.confirmed?
      errors.add(:booking, "must be confirmed before leaving a review")
    end
  end
end
