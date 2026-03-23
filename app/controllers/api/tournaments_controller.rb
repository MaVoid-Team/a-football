module Api
  class TournamentsController < BaseController
    def index
      tournaments = Tournament.visible_publicly.includes(:branch, :tournament_registrations)
      tournaments = tournaments.where(branch_id: params[:branch_id]) if params[:branch_id].present?
      tournaments = tournaments.where(status: params[:status]) if params[:status].present?
      tournaments = apply_sort(tournaments, { "start_date" => :start_date, "name" => :name }, { start_date: :asc })

      render json: TournamentSerializer.new(paginate(tournaments)).serializable_hash, status: :ok
    end

    def show
      tournament = Tournament.visible_publicly.find(params[:id])
      expires_in 15.seconds, public: true
      render json: TournamentSerializer.new(tournament).serializable_hash, status: :ok
    end

    def matches
      tournament = Tournament.visible_publicly.find(params[:id])
      matches = tournament.tournament_matches.includes(:team1, :team2, :winner).order(:round_number, :match_number)
      expires_in 10.seconds, public: true
      render json: TournamentMatchSerializer.new(matches).serializable_hash, status: :ok
    end

    def bracket
      tournament = Tournament.visible_publicly.find(params[:id])
      expires_in 10.seconds, public: true
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
  end
end
