class TournamentRegistration < ApplicationRecord
  belongs_to :tournament
  belongs_to :player, class_name: "TournamentPlayer"
  belongs_to :team, class_name: "TournamentTeam", optional: true
  belongs_to :approved_by, class_name: "Admin", optional: true

  enum :status, { pending: 0, approved: 1, rejected: 2, cancelled: 3 }
  enum :refund_status, { none: 0, eligible: 1, processed: 2 }

  validates :player_id, uniqueness: { scope: :tournament_id }

  scope :for_status, ->(status) { status.present? ? where(status: status) : all }

  def approve!(admin, notes: nil)
    update!(status: :approved, approved_by: admin, notes: notes)
    player.update!(status: :approved) if player.pending?
  end

  def reject!(admin, notes: nil)
    update!(status: :rejected, approved_by: admin, notes: notes)
    player.update!(status: :rejected) if player.pending?
  end
end
