class Booking < ApplicationRecord
  include MeiliSearch::Rails

  meilisearch enqueue: true, raise_on_failure: false do
    attribute :user_name, :user_phone, :branch_id, :court_id, :date, :status, :notes
    searchable_attributes [:user_name, :user_phone, :notes]
    filterable_attributes [:branch_id, :court_id, :date, :status]
  end

  belongs_to :branch
  belongs_to :court
  belongs_to :promo_code, optional: true
  has_many :payments, dependent: :destroy
  has_many :reviews, dependent: :destroy
  has_many :booking_slots, dependent: :destroy
  accepts_nested_attributes_for :booking_slots, allow_destroy: true
  has_one_attached :payment_screenshot

  enum :status, { confirmed: 0, cancelled: 1 }
  enum :payment_status, { pending: 0, paid: 1, failed: 2, refunded: 3 }

  validates :user_name, presence: true
  validates :user_phone, presence: true
  validates :date, presence: true
  validates :start_time, presence: true
  validates :end_time, presence: true
  validates :hours, presence: true, numericality: { greater_than: 0 }
  validates :total_price, presence: true, numericality: { greater_than_or_equal_to: 0 }

  scope :for_branch, ->(branch_id) { where(branch_id: branch_id) }
  scope :for_court, ->(court_id) { where(court_id: court_id) }
  scope :on_date, ->(date) { where(date: date) }
  scope :active, -> { where(status: :confirmed) }
  scope :in_date_range, ->(from_date, to_date) {
    scope = all
    scope = scope.where("date >= ?", from_date) if from_date.present?
    scope = scope.where("date <= ?", to_date) if to_date.present?
    scope
  }

  def self.overlapping(court_id, date, start_time, end_time)
    where(court_id: court_id, date: date, status: :confirmed)
      .where("start_time < ? AND end_time > ?", end_time, start_time)
  end
end
