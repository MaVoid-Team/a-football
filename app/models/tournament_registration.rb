class TournamentRegistration < ApplicationRecord
  belongs_to :tournament
  belongs_to :player, class_name: "TournamentPlayer"
  belongs_to :team, class_name: "TournamentTeam", optional: true
  belongs_to :approved_by, class_name: "Admin", optional: true

  enum :status, { pending: 0, approved: 1, rejected: 2, cancelled: 3 }
  enum :refund_status, { none: 0, eligible: 1, processed: 2 }, prefix: :refund

  validates :player_id, uniqueness: { scope: :tournament_id }

  scope :for_status, ->(status) { status.present? ? where(status: status) : all }

  def approve!(admin, notes: nil)
    apply_status!(status: :approved, admin: admin, notes: notes, team_status: :active)
  end

  def reject!(admin, notes: nil)
    apply_status!(status: :rejected, admin: admin, notes: notes, team_status: :pending)
  end

  def cancel!(admin, notes: nil, refund_status: nil)
    apply_status!(
      status: :cancelled,
      admin: admin,
      notes: notes,
      refund_status: refund_status || self.refund_status,
      team_status: :pending
    )
  end

  def affected_registrations
    if team_id.present?
      tournament.tournament_registrations.where(team_id: team_id).includes(:player, :team, tournament: :branch)
    else
      TournamentRegistration.where(id: id).includes(:player, :team, tournament: :branch)
    end
  end

  private

  def apply_status!(status:, admin:, notes:, team_status:, refund_status: nil)
    updated_ids = []

    self.class.transaction do
      affected_registrations.lock.each do |registration|
        attrs = {
          status: status,
          approved_by: admin,
          notes: notes
        }
        attrs[:refund_status] = refund_status if refund_status.present?

        registration.update!(attrs)
        registration.player.update!(status: status)
        updated_ids << registration.id
      end

      team&.update!(status: team_status) if team.present?
    end

    TournamentRegistration.where(id: updated_ids).includes(:player, :team, tournament: :branch).to_a
  end
end
