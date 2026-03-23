module Api
  module Admin
    module Crm
      class ScoringSettingsController < BaseController
        def show
          setting = find_setting
          render json: { data: serialize_setting(setting) }, status: :ok
        end

        def update
          setting = find_setting

          if setting.update(setting_params)
            render json: { data: serialize_setting(setting) }, status: :ok
          else
            render json: { errors: setting.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def find_setting
          branch_id = resolve_branch_id

          CrmScoringSetting.find_or_create_by!(branch_id: branch_id)
        end

        def resolve_branch_id
          requested_branch_id = params[:branch_id].presence || params.dig(:scoring_setting, :branch_id).presence

          if current_admin.super_admin?
            branch_id = requested_branch_id || Branch.order(:id).pick(:id)
            raise ActiveRecord::RecordNotFound, "Branch ID is required" if branch_id.blank?

            return branch_id
          end

          branch_id = current_admin.branch_id
          raise ActiveRecord::RecordNotFound, "Branch admin required" if branch_id.blank?

          branch_id
        end

        def setting_params
          params.require(:scoring_setting).permit(:activity_weight, :frequency_weight, :engagement_weight, :reliability_weight)
        end

        def serialize_setting(setting)
          {
            id: setting.id,
            branch_id: setting.branch_id,
            activity_weight: setting.activity_weight,
            frequency_weight: setting.frequency_weight,
            engagement_weight: setting.engagement_weight,
            reliability_weight: setting.reliability_weight,
            updated_at: setting.updated_at
          }
        end
      end
    end
  end
end
