class BlockedSlot < ApplicationRecord
  belongs_to :branch
  belongs_to :court

  validates :date, presence: true
  validates :start_time, presence: true
  validates :end_time, presence: true
  validate :end_time_after_start_time

  scope :for_branch, ->(branch_id) { where(branch_id: branch_id) }
  scope :for_court, ->(court_id) { where(court_id: court_id) }
  scope :on_date, ->(date) { where(date: date) }
  scope :in_date_range, ->(from_date, to_date) {
    scope = all
    scope = scope.where("date >= ?", from_date) if from_date.present?
    scope = scope.where("date <= ?", to_date) if to_date.present?
    scope
  }

  def self.overlapping(court_id, date, start_time, end_time)
    where(court_id: court_id, date: date)
      .where("start_time < ? AND end_time > ?", end_time, start_time)
  end

  private

  def end_time_after_start_time
    return unless start_time && end_time
    errors.add(:end_time, "must be after start time") if end_time <= start_time
  end
end
