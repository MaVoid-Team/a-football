module Api
  module Admin
    class TournamentMatchesController < BaseController
      def index
        tournament = Tournament.find(params[:tournament_id])
        authorize tournament, :show?

        matches = policy_scope(TournamentMatch)
                    .where(tournament_id: tournament.id)
                    .includes(:team1, :team2, :winner)
                    .order(:round_number, :match_number)
        matches = matches.where(status: params[:status]) if params[:status].present?
        matches = matches.where(round_number: params[:round_number].to_i) if params[:round_number].present?

        render json: TournamentMatchSerializer.new(paginate(matches)).serializable_hash, status: :ok
      end

      def schedule
        match = TournamentMatch.includes(:tournament).find(params[:id])
        authorize match.tournament, :update?

        manual_override = ActiveModel::Type::Boolean.new.cast(schedule_params[:override])
        if manual_override && !current_admin.super_admin?
          render json: {
            errors: ["Manual override is only allowed for super admins"],
            error_codes: ["override_not_allowed"]
          }, status: :forbidden
          return
        end

        if manual_override
          Rails.logger.info(
            "[TournamentScheduleOverride] admin_id=#{current_admin.id} match_id=#{match.id} tournament_id=#{match.tournament_id}"
          )
        end

        result = Tournaments::MatchScheduler.new(
          match: match,
          court_id: schedule_params[:court_id],
          scheduled_time: schedule_params[:scheduled_time],
          manual_override: manual_override
        ).call

        if result.failure?
          render json: { errors: result.errors, error_codes: result.error_codes }, status: :unprocessable_entity
          return
        end

        render json: TournamentMatchSerializer.new(result.data).serializable_hash, status: :ok
      end

      def lock
        match = TournamentMatch.includes(:tournament).find(params[:id])
        authorize match.tournament, :update?

        locked = ActiveModel::Type::Boolean.new.cast(lock_params[:locked])
        match.update!(schedule_locked: locked, schedule_lock_reason: lock_params[:reason])

        render json: TournamentMatchSerializer.new(match).serializable_hash, status: :ok
      end

      def score
        match = TournamentMatch.includes(:tournament).find(params[:id])
        authorize match.tournament, :update?

        result = Tournaments::ScoreUpdater.new(
          match: match,
          winner_id: score_params[:winner_id],
          score: score_params[:score]
        ).call

        if result.failure?
          render json: { errors: result.errors, error_codes: result.error_codes }, status: :unprocessable_entity
          return
        end

        render json: TournamentMatchSerializer.new(result.data).serializable_hash, status: :ok
      end

      private

      def schedule_params
        params.require(:match).permit(:court_id, :scheduled_time, :override)
      end

      def lock_params
        params.require(:match).permit(:locked, :reason)
      end

      def score_params
        permitted = params.require(:match).permit(:winner_id, score: {})
        permitted[:winner_id] = permitted[:winner_id].to_i if permitted[:winner_id].present?
        permitted
      end
    end
  end
end
