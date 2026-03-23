module Api
  module Me
    class TeamsController < BaseController
      def index
        teams = current_user.user_teams.order(created_at: :desc)
        render json: UserTeamSerializer.new(teams).serializable_hash, status: :ok
      end

      def create
        team = current_user.user_teams.new(team_params)

        if team.save
          render json: UserTeamSerializer.new(team).serializable_hash, status: :created
        else
          render json: { errors: team.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        team = current_user.user_teams.find(params[:id])

        if team.update(team_params)
          render json: UserTeamSerializer.new(team).serializable_hash, status: :ok
        else
          render json: { errors: team.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        team = current_user.user_teams.find(params[:id])
        team.destroy!
        head :no_content
      end

      private

      def team_params
        params.require(:team).permit(:name, :teammate_name, :teammate_phone, :teammate_email, :teammate_skill_level)
      end
    end
  end
end
