module Api
  class TournamentRegistrationsController < BaseController
    def create
      tournament = Tournament.find(params[:id])

      result = Tournaments::RegistrationService.new(
        tournament: tournament,
        registration_params: player_params
      ).call

      if result.failure?
        render json: { errors: result.errors, error_codes: result.error_codes }, status: :unprocessable_entity
        return
      end

      render json: TournamentRegistrationSerializer.new(result.data).serializable_hash, status: :created
    end

    private

    def player_params
      params.require(:registration).permit(:name, :phone, :skill_level)
    end

  end
end
