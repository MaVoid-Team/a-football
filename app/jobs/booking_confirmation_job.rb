class BookingConfirmationJob < ApplicationJob
  queue_as :bookings

  def perform(booking_id)
    booking = Booking.find_by(id: booking_id)
    return unless booking

    Rails.logger.info(
      "[BookingConfirmation] Booking ##{booking.id} confirmed for " \
      "#{booking.user_name} (#{booking.user_phone}) on #{booking.date} " \
      "#{booking.start_time.strftime('%H:%M')}-#{booking.end_time.strftime('%H:%M')}"
    )
  end
end
