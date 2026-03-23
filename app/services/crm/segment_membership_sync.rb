module Crm
  class SegmentMembershipSync
    def initialize(player:, branch_id: nil)
      @player = player
      @branch_id = branch_id
    end

    def call
      segments_scope = Segment.active_only.where(auto_update: true)
      segments_scope = segments_scope.where(branch_id: [nil, @branch_id]) if @branch_id.present?

      now = Time.current
      existing_ids = SegmentMembership.for_player(player_type, @player.id).pluck(:segment_id)
      matched_ids = []

      segments_scope.find_each do |segment|
        matches = Crm::ConditionMatcher.new(player: @player, conditions: segment.conditions).match?
        if matches
          matched_ids << segment.id
          SegmentMembership.upsert(
            {
              segment_id: segment.id,
              player_type: player_type,
              player_id: @player.id,
              branch_id: segment.branch_id || @branch_id,
              matched_at: now,
              created_at: now,
              updated_at: now
            },
            unique_by: :idx_segment_memberships_unique_player
          )
        end
      end

      stale_ids = existing_ids - matched_ids
      SegmentMembership.where(segment_id: stale_ids, player_type: player_type, player_id: @player.id).delete_all if stale_ids.any?

      matched_ids
    end

    private

    def player_type
      @player.class.name
    end
  end
end
