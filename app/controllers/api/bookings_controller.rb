module Api
  class BookingsController < BaseController
    def create
      branch = Branch.find(params[:branch_id])
      result = Bookings::Creator.new(params: booking_params, branch: branch, user: current_user).call

      if result.success?
        booking = result.data
        screenshot = params.dig(:booking, :payment_screenshot)
        booking.payment_screenshot.attach(screenshot) if screenshot.present?
        render json: BookingSerializer.new(booking.reload).serializable_hash, status: :created
      else
        render json: {
          errors: Array(result.errors),
          error_codes: Array(result.error_codes)
        }, status: :unprocessable_entity
      end
    end

    private

    def booking_params
      params.require(:booking).permit(
        :court_id, :user_name, :user_phone,
        :date, :start_time, :end_time, :notes, :promo_code,
        :pay_deposit,
        booking_slots_attributes: [:start_time, :end_time]
      )
    end
  end
end
