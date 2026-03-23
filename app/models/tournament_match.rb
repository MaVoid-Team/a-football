class TournamentMatch < ApplicationRecord
  belongs_to :tournament
  belongs_to :team1, class_name: "TournamentTeam", optional: true
  belongs_to :team2, class_name: "TournamentTeam", optional: true
  belongs_to :winner, class_name: "TournamentTeam", optional: true
  belongs_to :court, optional: true

  enum :status, { pending: 0, scheduled: 1, ongoing: 2, completed: 3 }

  validates :round_number, :match_number, presence: true
  validates :match_number, uniqueness: { scope: [:tournament_id, :round_number] }
  validate :winner_belongs_to_match
  validate :lock_reason_presence_when_locked

  def winner_belongs_to_match
    return if winner_id.blank?
    return if [team1_id, team2_id].include?(winner_id)

    errors.add(:winner_id, "must be one of the participating teams")
  end

  def lock_reason_presence_when_locked
    return unless schedule_locked?
    return if schedule_lock_reason.present?

    errors.add(:schedule_lock_reason, "must be present when scheduling is locked")
  end
end
