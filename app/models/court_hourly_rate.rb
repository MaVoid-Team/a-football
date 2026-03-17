class CourtHourlyRate < ApplicationRecord
  belongs_to :court

  validates :start_hour, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 23 }
  validates :end_hour, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 1, less_than_or_equal_to: 24 }
  validates :price_per_hour, presence: true, numericality: { greater_than: 0 }
  validate :end_hour_after_start_hour
  validate :no_overlapping_ranges

  scope :active, -> { where(active: true) }
  scope :ordered, -> { order(:start_hour, :end_hour) }

  private

  def end_hour_after_start_hour
    return if start_hour.blank? || end_hour.blank?
    errors.add(:end_hour, "must be greater than start hour") if end_hour <= start_hour
  end

  def no_overlapping_ranges
    return if court_id.blank? || start_hour.blank? || end_hour.blank?

    overlap = CourtHourlyRate
      .where(court_id: court_id, active: true)
      .where.not(id: id)
      .where("start_hour < ? AND end_hour > ?", end_hour, start_hour)
      .exists?

    errors.add(:base, "Time range overlaps with an existing pricing range") if overlap
  end
end
