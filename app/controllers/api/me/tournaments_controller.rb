module Api
  module Me
    class TournamentsController < BaseController
      def index
        TournamentPlayer.claim_for_account!(current_user)

        registrations = player_scope
                        .includes(registration_records: [:team, tournament: :branch])
                        .flat_map(&:registration_records)
                        .uniq(&:id)
                        .sort_by(&:created_at)
                        .reverse

        render json: { data: registrations.map { |registration| serialize_participation(registration) } }, status: :ok
      end

      def show
        tournament = Tournament.find(params[:id])
        TournamentPlayer.claim_for_account!(current_user)

        registration = player_scope
                       .where(tournament_id: tournament.id)
                       .includes(registration_records: :team)
                       .flat_map(&:registration_records)
                       .uniq(&:id)
                       .max_by(&:created_at)

        if registration.blank?
          render json: { error: "Participation not found" }, status: :not_found
          return
        end

        render json: { data: serialize_participation(registration) }, status: :ok
      end

      private

      def serialize_participation(registration)
        tournament = registration.tournament
        {
          id: registration.id.to_s,
          type: "tournament_participations",
          attributes: {
            registration_id: registration.id,
            tournament_id: tournament.id,
            tournament_name: tournament.name,
            tournament_type: tournament.tournament_type,
            tournament_status: tournament.status,
            branch_name: tournament.branch&.name,
            start_date: tournament.start_date,
            registration_status: registration.status,
            participation_status: derive_participation_status(registration),
            team_id: registration.team_id,
            team_name: registration.team&.name,
            created_at: registration.created_at
          }
        }
      end

      def derive_participation_status(registration)
        return registration.status unless registration.approved?

        return "completed" if registration.tournament.completed?
        return "eliminated" if registration.team&.eliminated?

        registration.status
      end

      def player_scope
        @player_scope ||= TournamentPlayer.for_account(current_user)
      end
    end
  end
end
