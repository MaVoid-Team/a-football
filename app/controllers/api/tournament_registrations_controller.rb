module Api
  class TournamentRegistrationsController < BaseController
    def create
      tournament = Tournament.find(params[:id])

      result = Tournaments::RegistrationService.new(
        tournament: tournament,
        registration_params: registration_payload
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

    def player_params
      params.require(:registration).permit(:name, :phone, :email, :skill_level)
    end

    def registration_payload
      payload = player_params.to_h
      return payload unless current_user.present?

      payload.merge(
        user_id: current_user.id,
        name: payload["name"].presence || current_user.name,
        phone: payload["phone"].presence || current_user.phone,
        email: payload["email"].presence || current_user.email,
        skill_level: payload["skill_level"].presence || current_user.skill_level
      )
    end

    def dispatch_registration_notification(tournament, registration)
      Tournaments::NotificationDispatcher.dispatch(
        event: :tournament_registration_created,
        tournament: tournament,
        payload: notification_payload(tournament, registration)
      )
    rescue StandardError => e
      Rails.logger.error(
        "[TournamentNotification] failed_to_dispatch event=tournament_registration_created " \
        "tournament_id=#{tournament.id} registration_id=#{registration.id} error_class=#{e.class} error=#{e.message}"
      )
    end

    def notification_payload(tournament, registration)
      {
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
    end

    def moderation_url_for(tournament)
      base_url = ENV.fetch("ADMIN_APP_URL", "").strip.sub(%r{\/+\z}, "")
      return nil if base_url.blank?

      "#{base_url}/en/tournaments/#{tournament.id}?tab=participants"
    end

  end
end
