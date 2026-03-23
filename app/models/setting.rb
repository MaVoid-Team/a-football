class Setting < ApplicationRecord
  belongs_to :branch

  validates :branch_id, uniqueness: true
  validates :deposit_percentage,
            numericality: {
              greater_than_or_equal_to: 0,
              less_than_or_equal_to: 100
            }
  validates :opening_hour, presence: true,
            numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than: 24 }
  validates :closing_hour, presence: true,
            numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 24 }
  validate :closing_after_opening
  validate :deposit_percentage_when_enabled

  private

  def closing_after_opening
    return unless opening_hour && closing_hour
    errors.add(:closing_hour, "must be after opening hour") if closing_hour <= opening_hour
  end

  def deposit_percentage_when_enabled
    return unless deposit_enabled?
    return if deposit_percentage.to_d.positive?

    errors.add(:deposit_percentage, "must be greater than 0 when deposit is enabled")
  end
end
