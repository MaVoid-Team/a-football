class ActionItem < ApplicationRecord
  STATUSES = %w[pending completed ignored].freeze

  belongs_to :automation_rule, optional: true
  belongs_to :suggested_template, class_name: "MessageTemplate", optional: true
  belongs_to :branch, optional: true
  belongs_to :acted_by_admin, class_name: "Admin", optional: true

  validates :player_type, :player_id, :reason, presence: true
  validates :player_type, inclusion: { in: %w[User TournamentPlayer] }
  validates :status, inclusion: { in: STATUSES }

  scope :recent_first, -> { order(created_at: :desc) }
  scope :for_branch, ->(branch_id) { branch_id.present? ? where(branch_id: branch_id) : all }
  scope :for_status, ->(status) { status.present? ? where(status: status) : all }

  def complete!(admin)
    update!(status: "completed", acted_by_admin: admin, completed_at: Time.current)
  end

  def ignore!(admin)
    update!(status: "ignored", acted_by_admin: admin, ignored_at: Time.current)
  end
end
