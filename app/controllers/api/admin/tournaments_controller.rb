module Api
  module Admin
    class TournamentsController < BaseController
      def index
        tournaments = policy_scope(Tournament).includes(:branch, :tournament_registrations)
        tournaments = tournaments.where(branch_id: params[:branch_id]) if params[:branch_id].present?
        tournaments = tournaments.where(status: params[:status]) if params[:status].present?
        tournaments = tournaments.where(tournament_type: params[:tournament_type]) if params[:tournament_type].present?
        tournaments = apply_sort(tournaments, { "start_date" => :start_date, "name" => :name }, { start_date: :asc })

        render json: TournamentSerializer.new(paginate(tournaments)).serializable_hash, status: :ok
      end

      def show
        tournament = Tournament.find(params[:id])
        authorize tournament
        render json: TournamentSerializer.new(tournament).serializable_hash, status: :ok
      end

      def create
        attrs = tournament_params.to_h
        attrs["status"] = "open" if attrs["status"].blank?

        tournament = Tournament.new(attrs)
        tournament.created_by = current_admin
        authorize tournament
        tournament.save!

        render json: TournamentSerializer.new(tournament).serializable_hash, status: :created
      end

      def update
        tournament = Tournament.find(params[:id])
        authorize tournament
        tournament.update!(tournament_params)

        render json: TournamentSerializer.new(tournament).serializable_hash, status: :ok
      end

      def start
        tournament = Tournament.find(params[:id])
        authorize tournament, :start?

        unless tournament.open? || tournament.full?
          render json: { errors: ["Tournament cannot be started from current status"], error_codes: ["invalid_state"] }, status: :unprocessable_entity
          return
        end

        if tournament.bracket_data.blank? || tournament.bracket_data["rounds"].blank?
          render json: { errors: ["Generate bracket before starting tournament"], error_codes: ["bracket_required"] }, status: :unprocessable_entity
          return
        end

        tournament.update!(status: :ongoing)
        render json: TournamentSerializer.new(tournament).serializable_hash, status: :ok
      end

      def generate_bracket
        tournament = Tournament.find(params[:id])
        authorize tournament, :generate_bracket?

        result = Tournaments::BracketGenerator.new(
          tournament: tournament,
          force: ActiveModel::Type::Boolean.new.cast(params[:force])
        ).call
        if result.failure?
          render json: { errors: result.errors, error_codes: result.error_codes }, status: :unprocessable_entity
          return
        end

        render json: TournamentSerializer.new(result.data).serializable_hash, status: :ok
      end

      def auto_schedule
        tournament = Tournament.find(params[:id])
        authorize tournament, :update?

        result = Tournaments::AutoScheduler.new(
          tournament: tournament,
          start_time: auto_schedule_params[:start_time],
          court_ids: auto_schedule_params[:court_ids],
          override_locked: ActiveModel::Type::Boolean.new.cast(auto_schedule_params[:override_locked])
        ).call

        if result.failure?
          render json: { errors: result.errors, error_codes: result.error_codes }, status: :unprocessable_entity
          return
        end

        render json: TournamentMatchSerializer.new(result.data).serializable_hash, status: :ok
      end

      def bracket
        tournament = Tournament.find(params[:id])
        authorize tournament, :bracket?

        render json: {
          data: {
            id: tournament.id.to_s,
            type: "tournament_brackets",
            attributes: {
              tournament_id: tournament.id,
              bracket: tournament.bracket_data
            }
          }
        }, status: :ok
      end

      private

      def tournament_params
        params.require(:tournament).permit(
          :branch_id,
          :name,
          :description,
          :tournament_type,
          :status,
          :max_players,
          :max_teams,
          :start_date,
          :end_date,
          :registration_deadline,
          :match_duration_minutes,
          :manual_seeding,
          :points_win,
          :points_loss
        )
      end

      def auto_schedule_params
        params.require(:schedule).permit(:start_time, :override_locked, court_ids: [])
      end
    end
  end
end
