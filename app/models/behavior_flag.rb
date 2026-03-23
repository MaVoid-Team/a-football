class BehaviorFlag < ApplicationRecord
  FLAG_TYPES = %w[inactive high_value at_risk unreliable].freeze

  belongs_to :branch, optional: true

  validates :player_type, :player_id, :flag_type, :reason, :assigned_at, presence: true
  validates :player_type, inclusion: { in: %w[User TournamentPlayer] }
  validates :flag_type, inclusion: { in: FLAG_TYPES }

  scope :for_player, ->(player_type, player_id) { where(player_type: player_type, player_id: player_id) }
  scope :active_only, -> { where(active: true) }
end
