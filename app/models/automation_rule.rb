class AutomationRule < ApplicationRecord
  TRIGGER_TYPES = %w[inactivity booking_created match_completed tournament_joined no_show_detected].freeze
  ACTION_TYPES = %w[suggest_whatsapp].freeze

  belongs_to :branch, optional: true
  belongs_to :template, class_name: "MessageTemplate", optional: true
  belongs_to :created_by_admin, class_name: "Admin", optional: true

  validates :name, presence: true
  validates :trigger_type, inclusion: { in: TRIGGER_TYPES }
  validates :action_type, inclusion: { in: ACTION_TYPES }

  scope :active_only, -> { where(is_active: true) }
  scope :for_branch, ->(branch_id) { where(branch_id: [nil, branch_id]) }
end
