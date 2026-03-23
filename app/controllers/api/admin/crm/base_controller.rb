module Api
  module Admin
    module Crm
      class BaseController < Api::Admin::BaseController
        skip_after_action :verify_authorized
        skip_after_action :verify_policy_scoped

        private

        def branch_filter
          return {} if current_admin.super_admin?

          { branch_id: current_admin.branch_id }
        end

        def scoped_segments
          current_admin.super_admin? ? Segment.all : Segment.for_branch(current_admin.branch_id)
        end

        def scoped_templates
          current_admin.super_admin? ? MessageTemplate.all : MessageTemplate.for_branch(current_admin.branch_id)
        end

        def scoped_activity_logs
          current_admin.super_admin? ? ActivityLog.all : ActivityLog.where(branch_id: current_admin.branch_id)
        end

        def scoped_automation_rules
          current_admin.super_admin? ? AutomationRule.all : AutomationRule.for_branch(current_admin.branch_id)
        end

        def scoped_action_items
          current_admin.super_admin? ? ActionItem.all : ActionItem.for_branch(current_admin.branch_id)
        end

        def find_player!(compound_id)
          player_type, player_id = compound_id.to_s.split("-", 2)
          raise ActiveRecord::RecordNotFound, "Invalid CRM player id" if player_type.blank? || player_id.blank?

          klass = player_type.safe_constantize
          raise ActiveRecord::RecordNotFound, "Unsupported player type" unless [User, TournamentPlayer].include?(klass)

          record = klass.find(player_id)

          if current_admin.branch_admin?
            allowed = scoped_activity_logs.where(player_type: player_type, player_id: record.id).exists?
            raise ActiveRecord::RecordNotFound, "Player not found" unless allowed
          end

          [player_type, record]
        end
      end
    end
  end
end
