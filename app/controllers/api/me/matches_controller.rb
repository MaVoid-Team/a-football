module Api
  module Me
    class MatchesController < BaseController
      def index
        if team_ids.empty?
          render json: TournamentMatchSerializer.new([]).serializable_hash, status: :ok
          return
        end

        matches = TournamentMatch
                  .includes(:tournament, :court, :team1, :team2, :winner)
                  .where("team1_id IN (:ids) OR team2_id IN (:ids)", ids: team_ids)
                  .order(Arel.sql("COALESCE(scheduled_time, created_at) ASC"))

        render json: TournamentMatchSerializer.new(matches).serializable_hash, status: :ok
      end

      private

      def team_ids
        @team_ids ||= TournamentTeam.where(player1_id: player_ids)
                                    .or(TournamentTeam.where(player2_id: player_ids))
                                    .pluck(:id)
      end

      def player_ids
        @player_ids ||= current_user.tournament_players.pluck(:id)
      end
    end
  end
end
