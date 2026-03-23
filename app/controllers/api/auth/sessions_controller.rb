module Api
  module Auth
    class SessionsController < Api::BaseController
      skip_before_action :authenticate_user!, only: %i[create]

      def create
        user = User.find_by(email: params[:email])

        if user&.authenticate(params[:password])
          token = ::Auth::JsonWebToken.encode(user_id: user.id)
          render json: {
            token: token,
            user: UserSerializer.new(user).serializable_hash
          }, status: :ok
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      def destroy
        ::Auth::TokenRevoker.revoke!(extract_token)
        head :no_content
      rescue ::Auth::AuthenticationError
        head :no_content
      end
    end
  end
end
