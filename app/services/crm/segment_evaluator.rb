module Crm
  class SegmentEvaluator
    def initialize(segment:, player:)
      @segment = segment
      @player = player
    end

    def match?
      Crm::ConditionMatcher.new(player: @player, conditions: @segment.conditions).match?
    end
  end
end
