class CrmScoringSetting < ApplicationRecord
  belongs_to :branch

  validates :branch_id, uniqueness: true
  validates :activity_weight, :frequency_weight, :engagement_weight, :reliability_weight, numericality: { greater_than_or_equal_to: 0 }

  validate :weights_total_positive

  private

  def weights_total_positive
    total = activity_weight.to_i + frequency_weight.to_i + engagement_weight.to_i + reliability_weight.to_i
    errors.add(:base, "Weights must sum to a positive number") if total <= 0
  end
end
