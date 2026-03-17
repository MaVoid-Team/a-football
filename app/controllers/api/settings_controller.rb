module Api
  class SettingsController < BaseController
    def show
      setting = Setting.find_by!(branch_id: params[:branch_id])
      render json: SettingSerializer.new(setting).serializable_hash, status: :ok
    end
  end
end
