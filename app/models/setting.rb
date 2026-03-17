class Setting < ApplicationRecord
  belongs_to :branch

  validates :branch_id, uniqueness: true
  validates :opening_hour, presence: true,
            numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than: 24 }
  validates :closing_hour, presence: true,
            numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 24 }
  validate :closing_after_opening

  private

  def closing_after_opening
    return unless opening_hour && closing_hour
    errors.add(:closing_hour, "must be after opening hour") if closing_hour <= opening_hour
  end
end
