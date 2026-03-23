class ActivityLog < ApplicationRecord
  belongs_to :player, polymorphic: true, optional: true
  belongs_to :reference, polymorphic: true, optional: true
  belongs_to :branch, optional: true
  belongs_to :actor_admin, class_name: "Admin", optional: true

  ACTIVITY_TYPES = %w[booking tournament_join match_played cancel no_show].freeze

  validates :activity_type, presence: true, inclusion: { in: ACTIVITY_TYPES }

  scope :recent_first, -> { order(created_at: :desc) }
  scope :for_branch, ->(branch_id) { branch_id.present? ? where(branch_id: branch_id) : all }
  scope :for_activity_type, ->(activity_type) { activity_type.present? ? where(activity_type: activity_type) : all }
end
