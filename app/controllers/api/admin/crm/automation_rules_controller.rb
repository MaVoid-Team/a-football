module Api
  module Admin
    module Crm
      class AutomationRulesController < BaseController
        def index
          rules = scoped_automation_rules.order(created_at: :desc)
          render json: { data: rules.map { |rule| serialize_rule(rule) } }, status: :ok
        end

        def create
          rule = scoped_automation_rules.new(rule_params)
          rule.created_by_admin = current_admin

          if rule.save
            render json: { data: serialize_rule(rule) }, status: :created
          else
            render json: { errors: rule.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          rule = scoped_automation_rules.find(params[:id])

          if rule.update(rule_params)
            render json: { data: serialize_rule(rule) }, status: :ok
          else
            render json: { errors: rule.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def rule_params
          permitted = params.require(:automation_rule).permit(:name, :trigger_type, :action_type, :template_id, :is_active, :branch_id)
          permitted[:conditions] = params.dig(:automation_rule, :conditions) if params.dig(:automation_rule, :conditions).present?
          permitted
        end

        def serialize_rule(rule)
          {
            id: rule.id,
            name: rule.name,
            trigger_type: rule.trigger_type,
            conditions: rule.conditions,
            action_type: rule.action_type,
            template_id: rule.template_id,
            is_active: rule.is_active,
            branch_id: rule.branch_id,
            created_by_admin_id: rule.created_by_admin_id,
            created_at: rule.created_at,
            updated_at: rule.updated_at
          }
        end
      end
    end
  end
end
