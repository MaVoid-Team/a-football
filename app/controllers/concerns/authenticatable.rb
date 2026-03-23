module Authenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_admin!
  end

  private

  def authenticate_admin!
    token = extract_token
    raise ::Auth::AuthenticationError, "Missing or invalid token" if token.blank?
    raise ::Auth::AuthenticationError, "Token has been revoked" if token_revoked?(token)

    decoded = ::Auth::JsonWebToken.decode(token)
    @current_admin = Admin.find(decoded[:admin_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Admin not found" }, status: :unauthorized
  rescue ::Auth::AuthenticationError => e
    render json: { error: e.message }, status: :unauthorized
  end

  def current_admin
    @current_admin
  end

  def extract_token
    header = request.headers["Authorization"]
    header&.split(" ")&.last
  end

  def token_revoked?(token)
    REDIS.get("revoked_token:#{Digest::SHA256.hexdigest(token)}").present?
  end
end
