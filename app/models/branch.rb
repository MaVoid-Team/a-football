class Branch < ApplicationRecord
  include MeiliSearch::Rails

  meilisearch enqueue: true, raise_on_failure: false do
    attribute :name, :address, :active
    searchable_attributes [:name, :address]
    filterable_attributes [:active]
  end

  has_many :admins, dependent: :destroy
  has_many :courts, dependent: :destroy
  has_many :packages, dependent: :destroy
  has_many :events, dependent: :destroy
  has_many :tournaments, dependent: :destroy
  has_many :bookings, dependent: :destroy
  has_many :blocked_slots, dependent: :destroy
  has_many :promo_codes, dependent: :destroy
  has_many :reviews, dependent: :destroy
  has_one :setting, dependent: :destroy

  validates :name, presence: true
  validates :timezone, presence: true

  scope :active, -> { where(active: true) }
  scope :active_filter, ->(val) { val.present? ? where(active: ActiveModel::Type::Boolean.new.cast(val)) : all }
end
