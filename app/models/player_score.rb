class PlayerScore < ApplicationRecord
  belongs_to :branch, optional: true

  validates :player_type, :player_id, presence: true
  validates :player_type, inclusion: { in: %w[User TournamentPlayer] }
  validates :player_id, uniqueness: { scope: :player_type }

  scope :for_player, ->(player_type, player_id) { where(player_type: player_type, player_id: player_id) }
end
