module Api
  class CourtsController < BaseController
    skip_before_action :authenticate_user!, only: %i[index show]

    def index
      courts = Court.includes(:perks, :hourly_rates).active
      
      # Filter by branch if specified
      if params[:branch_id].present?
        courts = courts.where(branch_id: params[:branch_id])
      end
      
      render json: CourtSerializer.new(courts, include: [:perks, :hourly_rates]).serializable_hash, status: :ok
    end
    
    def show
      court = Court.includes(:perks, :hourly_rates).active.find(params[:id])
      render json: CourtSerializer.new(court, include: [:perks, :hourly_rates]).serializable_hash, status: :ok
    end
  end
end
