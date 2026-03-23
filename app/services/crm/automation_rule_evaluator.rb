require "ostruct"

module Crm
  class AutomationRuleEvaluator
    EVENT_TRIGGER_MAP = {
      "booking" => "booking_created",
      "match_played" => "match_completed",
      "tournament_join" => "tournament_joined",
      "no_show" => "no_show_detected"
    }.freeze

    def initialize(player:, branch_id:, event_activity_type: nil)
      @player = player
      @branch_id = branch_id
      @event_activity_type = event_activity_type
    end

    def call
      trigger_type = EVENT_TRIGGER_MAP[@event_activity_type.to_s]
      return [] if trigger_type.blank?

      evaluate_trigger(trigger_type)
    end

    def self.run_inactivity_sweep(branch_id:)
      rules = AutomationRule.active_only.for_branch(branch_id).where(trigger_type: "inactivity")
      return 0 if rules.none?

      players = Crm::PlayerScope.new(admin: OpenStruct.new(super_admin?: false, branch_admin?: true, branch_id: branch_id)).all_entries
      created = 0

      players.each do |entry|
        rules.each do |rule|
          next unless Crm::ConditionMatcher.new(player: entry.record, conditions: rule.conditions).match?

          created += 1 if Crm::ActionItemCreator.new(player: entry.record, rule: rule, branch_id: branch_id).call
        end
      end

      created
    end

    private

    def evaluate_trigger(trigger_type)
      rules = AutomationRule.active_only.for_branch(@branch_id).where(trigger_type: trigger_type)
      created_ids = []

      rules.find_each do |rule|
        next unless Crm::ConditionMatcher.new(player: @player, conditions: rule.conditions).match?

        action_item = Crm::ActionItemCreator.new(player: @player, rule: rule, branch_id: @branch_id).call
        created_ids << action_item.id if action_item.present?
      end

      created_ids
    end
  end
end
