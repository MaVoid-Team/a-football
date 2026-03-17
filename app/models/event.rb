class Event < ApplicationRecord
  include MeiliSearch::Rails

  belongs_to :branch
  has_many :event_bookings, dependent: :destroy

  meilisearch enqueue: true, raise_on_failure: false do
    attribute :title, :description, :branch_id, :start_date
    searchable_attributes [:title, :description]
    filterable_attributes [:branch_id]
  end

  validates :title, presence: true
  validates :start_date, presence: true
  validates :participation_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :max_participants, presence: true, numericality: { greater_than: 0 }

  scope :for_branch, ->(branch_id) { where(branch_id: branch_id) }
  scope :upcoming, -> { where("start_date >= ?", Time.current) }
  scope :in_date_range, ->(from_date, to_date) {
    scope = all
    scope = scope.where("start_date >= ?", Date.parse(from_date)) if from_date.present?
    scope = scope.where("start_date <= ?", Date.parse(to_date).end_of_day) if to_date.present?
    scope
  }

  def confirmed_bookings_count
    event_bookings.confirmed.count
  end

  def remaining_spots
    max_participants - confirmed_bookings_count
  end

  def whatsapp_redirect_link
    setting = branch.setting
    return nil unless setting&.whatsapp_number.present?

    encoded_text = ERB::Util.url_encode("I want to join #{title}")
    "https://wa.me/#{setting.whatsapp_number}?text=#{encoded_text}"
  end
end
