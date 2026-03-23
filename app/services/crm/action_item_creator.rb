module Crm
  class ActionItemCreator
    COOLDOWN_HOURS = 24

    def initialize(player:, rule:, branch_id: nil)
      @player = player
      @rule = rule
      @branch_id = branch_id
    end

    def call
      return nil if recent_duplicate_exists?

      ActionItem.create!(
        player_type: @player.class.name,
        player_id: @player.id,
        automation_rule: @rule,
        suggested_template: @rule.template,
        branch_id: @branch_id || @rule.branch_id,
        reason: reason_text,
        status: "pending"
      )
    end

    private

    def recent_duplicate_exists?
      ActionItem
        .where(player_type: @player.class.name, player_id: @player.id, automation_rule_id: @rule.id, status: "pending")
        .where("created_at >= ?", COOLDOWN_HOURS.hours.ago)
        .exists?
    end

    def reason_text
      "#{@rule.name}: matched #{@rule.trigger_type} conditions"
    end
  end
end
