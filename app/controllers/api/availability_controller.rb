module Api
  class AvailabilityController < BaseController
    skip_before_action :authenticate_user!, only: %i[index]

    def index
      branch = Branch.active.find(params[:branch_id])
      court = branch.courts.active.find(params[:court_id])

      date = params[:date] || Date.current.to_s

      slots = Availability::Calculator.new(
        branch_id: branch.id,
        court_id: court.id,
        date: date
      ).call

      render json: {
        branch_id: branch.id,
        court_id: court.id,
        date: date,
        available_slots: slots
      }, status: :ok
    end
  end
end
