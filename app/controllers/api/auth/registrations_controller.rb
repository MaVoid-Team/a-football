module Api
  module Auth
    class RegistrationsController < Api::BaseController
      skip_before_action :authenticate_user!, only: %i[create]

      def create
        user = User.new(user_params)

        if user.save
          token = ::Auth::JsonWebToken.encode(user_id: user.id)
          render json: {
            token: token,
            user: UserSerializer.new(user).serializable_hash
          }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def user_params
        params.require(:user).permit(:name, :phone, :email, :password, :skill_level)
      end
    end
  end
end
