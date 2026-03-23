module Api
  module Admin
    class TournamentRegistrationsController < BaseController
      def index
        tournament = Tournament.find(params[:tournament_id])
        authorize tournament, :show?

        registrations = tournament.tournament_registrations.includes(:player, :team).order(created_at: :desc)
        registrations = registrations.where(status: params[:status]) if params[:status].present?

        render json: TournamentRegistrationSerializer.new(paginate(registrations)).serializable_hash, status: :ok
      end

      def update
        registration = TournamentRegistration.includes(:tournament, :player).find(params[:id])
        authorize registration.tournament, :update?

        action = update_params[:status]
        case action
        when "approved"
          registration.approve!(current_admin, notes: update_params[:notes])
        when "rejected"
          registration.reject!(current_admin, notes: update_params[:notes])
        when "cancelled"
          registration.update!(status: :cancelled, notes: update_params[:notes], refund_status: update_params[:refund_status] || registration.refund_status)
          registration.player.update!(status: :cancelled)
        else
          render json: { errors: ["Invalid status action"] }, status: :unprocessable_entity
          return
        end

        if update_params[:refund_status].present? && action != "cancelled"
          registration.update!(refund_status: update_params[:refund_status])
        end

        Tournaments::NotificationDispatcher.dispatch(
          event: :registration_status_changed,
          tournament: registration.tournament,
          payload: {
            registration_id: registration.id,
            status: registration.status,
            player_id: registration.player_id,
            refund_status: registration.refund_status
          }
        )

        render json: TournamentRegistrationSerializer.new(registration).serializable_hash, status: :ok
      end

      private

      def update_params
        params.require(:registration).permit(:status, :notes, :refund_status)
      end
    end
  end
end
