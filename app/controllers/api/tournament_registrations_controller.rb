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

      registration = result.data
      Tournaments::NotificationDispatcher.dispatch(
        event: :tournament_registration_created,
        tournament: tournament,
        payload: {
          registration_id: registration.id,
          player_id: registration.player_id,
          player_name: registration.player&.name,
          player_phone: registration.player&.phone,
          player_email: registration.player&.email,
          status: registration.status
        }
      )

      render json: TournamentRegistrationSerializer.new(registration).serializable_hash, status: :created
    end

    private

    def player_params
      params.require(:registration).permit(:name, :phone, :email, :skill_level)
    end

  end
end
