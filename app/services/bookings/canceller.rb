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

      ServiceResult.success(@booking.reload)
    rescue ActiveRecord::RecordInvalid => e
      ServiceResult.failure(e.record.errors.full_messages)
    end
  end
end
