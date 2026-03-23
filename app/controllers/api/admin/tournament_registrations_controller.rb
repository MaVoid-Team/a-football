module Api
  module Admin
    class TournamentRegistrationsController < BaseController
      def index
        tournament = Tournament.find(params[:tournament_id])
        authorize tournament, :show?

        registrations = policy_scope(TournamentRegistration)
                          .where(tournament_id: tournament.id)
                          .includes(:player, :team)
                          .order(created_at: :desc)
        registrations = registrations.where(status: params[:status]) if params[:status].present?

        render json: TournamentRegistrationSerializer.new(paginate(registrations)).serializable_hash, status: :ok
      end

      def update
        registration = TournamentRegistration.includes(:tournament, :player).find(params[:id])
        authorize registration.tournament, :update?

        action = update_params[:status]
        updated_registrations = []
        case action
        when "approved"
          updated_registrations = registration.approve!(current_admin, notes: update_params[:notes])
        when "rejected"
          updated_registrations = registration.reject!(current_admin, notes: update_params[:notes])
        when "cancelled"
          updated_registrations = registration.cancel!(
            current_admin,
            notes: update_params[:notes],
            refund_status: update_params[:refund_status] || registration.refund_status
          )
        else
          render json: { errors: ["Invalid status action"], error_codes: ["invalid_status_action"] }, status: :unprocessable_entity
          return
        end

        updated_registrations.each do |updated_registration|
          if update_params[:refund_status].present? && action != "cancelled"
            updated_registration.update!(refund_status: update_params[:refund_status])
          end

          Tournaments::NotificationDispatcher.dispatch(
            event: :registration_status_changed,
            tournament: updated_registration.tournament,
            payload: notification_payload(updated_registration)
          )

          Users::NotificationPublisher.registration_status_changed(updated_registration)
        end

        registration.reload
        render json: TournamentRegistrationSerializer.new(registration).serializable_hash, status: :ok
      end

      private

      def update_params
        params.require(:registration).permit(:status, :notes, :refund_status)
      end

      def notification_payload(registration)
        {
          registration_id: registration.id,
          status: registration.status,
          player_id: registration.player_id,
          player_name: registration.player&.name,
          player_phone: registration.player&.phone,
          player_email: registration.player&.email,
          refund_status: registration.refund_status,
          tournament_name: registration.tournament.name,
          branch_name: registration.tournament.branch&.name,
          moderation_url: moderation_url_for(registration.tournament)
        }
      end

      def moderation_url_for(tournament)
        base_url = ENV.fetch("ADMIN_APP_URL", "").strip.sub(%r{\/+\z}, "")
        return nil if base_url.blank?

        "#{base_url}/en/tournaments/#{tournament.id}?tab=participants"
      end
    end
  end
end
