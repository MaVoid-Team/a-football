class Court < ApplicationRecord
  include MeiliSearch::Rails

  meilisearch enqueue: true, raise_on_failure: false do
    attribute :name, :branch_id, :active
    searchable_attributes [:name]
    filterable_attributes [:branch_id, :active]
  end

  belongs_to :branch
  has_many :bookings, dependent: :destroy
  has_many :blocked_slots, dependent: :destroy
  has_many :perks, dependent: :destroy
  has_many :hourly_rates, class_name: "CourtHourlyRate", dependent: :destroy
  has_many :reviews, dependent: :destroy

  validates :name, presence: true
  validates :price_per_hour, presence: true, numericality: { greater_than: 0 }

  scope :active, -> { where(active: true) }
  scope :for_branch, ->(branch_id) { where(branch_id: branch_id) }
  scope :active_filter, ->(val) { val.present? ? where(active: ActiveModel::Type::Boolean.new.cast(val)) : all }
end
