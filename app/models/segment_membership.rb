class SegmentMembership < ApplicationRecord
  belongs_to :segment
  belongs_to :branch, optional: true

  validates :player_type, :player_id, :matched_at, presence: true
  validates :player_type, inclusion: { in: %w[User TournamentPlayer] }
  validates :player_id, uniqueness: { scope: [:segment_id, :player_type] }

  scope :for_player, ->(player_type, player_id) { where(player_type: player_type, player_id: player_id) }
  scope :for_segment, ->(segment_id) { where(segment_id: segment_id) }
end
