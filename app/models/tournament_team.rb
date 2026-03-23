class TournamentTeam < ApplicationRecord
  belongs_to :tournament
  belongs_to :player1, class_name: "TournamentPlayer"
  belongs_to :player2, class_name: "TournamentPlayer", optional: true

  has_many :team1_matches,
           class_name: "TournamentMatch",
           foreign_key: :team1_id,
           dependent: :nullify
  has_many :team2_matches,
           class_name: "TournamentMatch",
           foreign_key: :team2_id,
           dependent: :nullify

  enum :status, { pending: 0, active: 1, eliminated: 2 }

  validates :name, presence: true
  validate :players_belong_to_tournament
  validate :player_pair_not_duplicate

  def players_belong_to_tournament
    return if player1.blank?

    if player1.tournament_id != tournament_id || (player2.present? && player2.tournament_id != tournament_id)
      errors.add(:base, "players must belong to same tournament")
    end
  end

  def player_pair_not_duplicate
    return if player2.blank?
    return unless player1_id == player2_id

    errors.add(:player2_id, "must be different from player1")
  end
end
