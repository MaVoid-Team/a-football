class Segment < ApplicationRecord
  belongs_to :branch, optional: true

  validates :name, presence: true, uniqueness: { scope: :branch_id }
  validates :conditions, presence: true

  scope :active_only, -> { where(active: true) }
  scope :for_branch, ->(branch_id) { where(branch_id: [nil, branch_id]) }
end
