class Segment < ApplicationRecord
  belongs_to :branch, optional: true

  validates :name, presence: true, uniqueness: { scope: :branch_id }
  validates :conditions, presence: true
  validates :auto_update, inclusion: { in: [true, false] }

  scope :active_only, -> { where(active: true) }
  scope :auto_update_only, -> { where(auto_update: true) }
  scope :for_branch, ->(branch_id) { where(branch_id: [nil, branch_id]) }
end
