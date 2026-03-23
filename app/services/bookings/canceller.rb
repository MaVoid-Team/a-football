module Bookings
  class Canceller
    def initialize(booking:)
      @booking = booking
    end

    def call
      return ServiceResult.failure("Booking is already cancelled") if @booking.cancelled?

      ActiveRecord::Base.transaction do
        @booking.cancelled!
      end

      Availability::CacheInvalidator.new(
        branch_id: @booking.branch_id,
        court_id: @booking.court_id,
        date: @booking.date
      ).call

      Crm::ActivityLogger.new(
        player: @booking.user,
        activity_type: "cancel",
        reference: @booking,
        branch_id: @booking.branch_id,
        metadata: {
          booking_id: @booking.id,
          user_name: @booking.user_name,
          user_phone: @booking.user_phone,
          date: @booking.date
        }
      ).call

      ServiceResult.success(@booking.reload)
    rescue ActiveRecord::RecordInvalid => e
      ServiceResult.failure(e.record.errors.full_messages)
    end
  end
end
