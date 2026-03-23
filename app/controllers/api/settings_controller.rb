module Api
  class SettingsController < BaseController
    skip_before_action :authenticate_user!, only: %i[show]

    def show
      setting = Setting.find_by!(branch_id: params[:branch_id])
      render json: SettingSerializer.new(setting).serializable_hash, status: :ok
    end
  end
end
