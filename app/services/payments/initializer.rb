module Payments
  class Initializer
    def initialize(booking:, provider: "manual")
      @booking = booking
      @provider = provider
    end

    def call
      payment = Payment.create!(
        booking: @booking,
        provider: @provider,
        status: "pending",
        amount: @booking.total_price,
        raw_payload: {}
      )

      ServiceResult.success(payment)
    rescue ActiveRecord::RecordInvalid => e
      ServiceResult.failure(e.record.errors.full_messages)
    end
  end
end
