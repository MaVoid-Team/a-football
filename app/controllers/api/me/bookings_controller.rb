module Api
  module Me
    class BookingsController < BaseController
      def index
        bookings = current_user.bookings.includes(:branch, :court, :promo_code, :booking_slots).order(date: :desc, start_time: :desc)
        render json: BookingSerializer.new(bookings).serializable_hash, status: :ok
      end
    end
  end
end
