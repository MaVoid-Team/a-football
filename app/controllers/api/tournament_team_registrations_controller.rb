module Api
  class TournamentTeamRegistrationsController < BaseController
    include UserAuthenticatable

    def create
      tournament = Tournament.find(params[:id])
      result = Tournaments::TeamRegistrationService.new(
        tournament: tournament,
        user: current_user,
        team_params: team_params
      ).call

      if result.failure?
        render json: { errors: result.errors, error_codes: result.error_codes }, status: :unprocessable_entity
        return
      end

      registration = result.data
      dispatch_registration_notification(tournament, registration)

      render json: TournamentRegistrationSerializer.new(registration).serializable_hash, status: :created
    end

    private

    def team_params
      params.require(:team_registration).permit(
        :user_team_id,
        :team_name,
        :teammate_name,
        :teammate_phone,
        :teammate_email,
        :teammate_skill_level,
        :save_team
      )
    end

    def dispatch_registration_notification(tournament, registration)
      Tournaments::NotificationDispatcher.dispatch(
        event: :tournament_registration_created,
        tournament: tournament,
        payload: {
          registration_id: registration.id,
          player_id: registration.player_id,
          player_name: registration.player&.name,
          player_phone: registration.player&.phone,
          player_email: registration.player&.email,
          player_skill_level: registration.player&.skill_level,
          status: registration.status,
          tournament_name: tournament.name,
          branch_name: tournament.branch&.name,
          moderation_url: moderation_url_for(tournament)
        }
      )
    rescue StandardError => e
      Rails.logger.error(
        "[TournamentNotification] failed_to_dispatch event=tournament_registration_created " \
        "tournament_id=#{tournament.id} registration_id=#{registration.id} error_class=#{e.class} error=#{e.message}"
      )
    end

    def moderation_url_for(tournament)
      base_url = ENV.fetch("ADMIN_APP_URL", "").strip.sub(%r{\/+\z}, "")
      return nil if base_url.blank?

      "#{base_url}/en/tournaments/#{tournament.id}?tab=participants"
    end
  end
end
