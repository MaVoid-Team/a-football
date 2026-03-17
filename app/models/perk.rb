class Perk < ApplicationRecord
  belongs_to :court

  validates :name, presence: true
  validates :court, presence: true
  validates :position, numericality: { greater_than_or_equal_to: 0 }
  
  scope :active, -> { where(active: true) }
  scope :ordered, -> { order(:position) }
  
  def self.for_court(court_id)
    where(court_id: court_id).active.ordered
  end
end
