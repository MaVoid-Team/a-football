module Api
  module Admin
    class SettingsController < BaseController
      skip_after_action :verify_authorized
      skip_after_action :verify_policy_scoped
      after_action :verify_authorized, only: %i[show create update]

      def show
        branch_id = resolve_branch_id
        setting = Setting.find_by(branch_id: branch_id)
        if setting
          authorize setting
          render json: SettingSerializer.new(setting).serializable_hash, status: :ok
        else
          skip_authorization
          render json: { data: nil }, status: :ok
        end
      end

      def create
        branch_id = resolve_branch_id
        setting = Setting.find_or_initialize_by(branch_id: branch_id)
        setting.assign_attributes(setting_params)
        authorize setting
        setting.save!
        render json: SettingSerializer.new(setting).serializable_hash, status: :created
      end

      def update
        branch_id = resolve_branch_id
        setting = Setting.find_by!(branch_id: branch_id)
        authorize setting
        setting.update!(setting_params)
        render json: SettingSerializer.new(setting).serializable_hash, status: :ok
      end

      private

      def resolve_branch_id
        bid = params[:branch_id].presence || params.dig(:setting, :branch_id).presence
        if current_admin.super_admin? && bid.present?
          bid
        elsif current_admin.branch_id.present?
          current_admin.branch_id
        else
          raise ActiveRecord::RecordNotFound, "Branch ID is required"
        end
      end

      def setting_params
        params.require(:setting).permit(
          :branch_id, :whatsapp_number,
          :contact_email, :contact_phone,
          :opening_hour, :closing_hour,
          :booking_terms, :payment_number,
          :deposit_enabled, :deposit_percentage,
          :tournament_registration_admin_email,
          :send_registration_alerts_to_global_recipient
        )
      end
    end
  end
end
