module Api
  class BaseController < ApplicationController
    include Paginatable
    include Filterable

    rescue_from ActiveRecord::RecordNotFound, with: :not_found
    rescue_from ActiveRecord::RecordInvalid, with: :unprocessable_entity
    rescue_from ActionController::ParameterMissing, with: :bad_request
    rescue_from Pundit::NotAuthorizedError, with: :forbidden

    private

    def current_user
      return @current_user if defined?(@current_user)

      token = extract_token
      @current_user =
        begin
          return @current_user = nil if token.blank? || token_revoked?(token)

          decoded = ::Auth::JsonWebToken.decode(token)
          decoded[:user_id].present? ? User.find_by(id: decoded[:user_id]) : nil
        rescue ::Auth::AuthenticationError
          nil
        end
    end

    def extract_token
      request.headers["Authorization"]&.split(" ")&.last
    end

    def token_revoked?(token)
      REDIS.get("revoked_token:#{Digest::SHA256.hexdigest(token)}").present?
    end

    def not_found(exception)
      render json: { error: exception.message }, status: :not_found
    end

    def unprocessable_entity(exception)
      render json: { errors: exception.record.errors.full_messages }, status: :unprocessable_entity
    end

    def bad_request(exception)
      render json: { error: exception.message }, status: :bad_request
    end

    def forbidden(_exception)
      render json: { error: "You are not authorized to perform this action" }, status: :forbidden
    end
  end
end
