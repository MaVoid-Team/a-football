class BookingExpirationJob < ApplicationJob
  queue_as :bookings

  EXPIRATION_HOURS = 24

  def perform
    expired_bookings = Booking.confirmed.pending
                              .where("created_at < ?", EXPIRATION_HOURS.hours.ago)

    expired_bookings.find_each do |booking|
      result = Bookings::Canceller.new(booking: booking).call

      if result.success?
        Rails.logger.info("[BookingExpiration] Booking ##{booking.id} expired and cancelled")
      else
        Rails.logger.error("[BookingExpiration] Failed to cancel booking ##{booking.id}: #{result.errors}")
      end
    end
  end
end
