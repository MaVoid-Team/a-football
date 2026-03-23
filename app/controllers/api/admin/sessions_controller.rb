module Api
  module Admin
    class SessionsController < Api::BaseController
      def create
        admin = ::Admin.find_by(email: params[:email])

        if admin&.authenticate(params[:password])
          token = Auth::JsonWebToken.encode(admin_id: admin.id)
          render json: {
            token: token,
            admin: AdminSerializer.new(admin).serializable_hash
          }, status: :ok
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      def destroy
        ::Auth::TokenRevoker.revoke!(request.headers["Authorization"]&.split(" ")&.last)
        head :no_content
      rescue Auth::AuthenticationError
        head :no_content
      end
    end
  end
end
