module Api
  module Me
    class ProfilesController < BaseController
      def show
        render json: UserSerializer.new(current_user).serializable_hash, status: :ok
      end

      def update
        if current_user.update(profile_params)
          render json: UserSerializer.new(current_user).serializable_hash, status: :ok
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def profile_params
        params.require(:user).permit(:name, :phone, :email, :skill_level, :password)
      end
    end
  end
end
