module UserAuthenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  private

  def authenticate_user!
    return if current_user.present?

    render json: { error: "User authentication required" }, status: :unauthorized
  end
end
