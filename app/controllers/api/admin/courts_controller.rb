module Api
  module Admin
    class CourtsController < BaseController
      def index
        courts = policy_scope(Court).includes(:branch, :perks, :hourly_rates)
        courts = courts.where(branch_id: params[:branch_id]) if params[:branch_id].present?
        courts = courts.active_filter(params[:active]) if params[:active].present?
        courts = apply_sort(courts, { "name" => :name, "price_per_hour" => :price_per_hour }, { name: :asc })

        result = search_with_pagination(Court, courts, build_court_filter)
        render json: CourtSerializer.new(result, include: [:perks, :hourly_rates]).serializable_hash, status: :ok
      end

      def show
        court = Court.includes(:perks, :hourly_rates).find(params[:id])
        authorize court
        render json: CourtSerializer.new(court, include: [:perks, :hourly_rates]).serializable_hash, status: :ok
      end

      def create
        court = Court.new(court_params)
        authorize court
        court.save!
        render json: CourtSerializer.new(court, include: [:perks, :hourly_rates]).serializable_hash, status: :created
      end

      def update
        court = Court.find(params[:id])
        authorize court
        court.update!(court_params)
        render json: CourtSerializer.new(court, include: [:perks, :hourly_rates]).serializable_hash, status: :ok
      end

      def destroy
        court = Court.find(params[:id])
        authorize court
        court.destroy!
        head :no_content
      end

      private

      def court_params
        params.require(:court).permit(:branch_id, :name, :price_per_hour, :active)
      end

      def build_court_filter
        parts = []
        parts << "branch_id = #{params[:branch_id].to_i}" if params[:branch_id].present?
        parts << "active = #{params[:active].to_s.downcase == 'true'}" if params[:active].present?
        build_meilisearch_filter(parts)
      end
    end
  end
end
