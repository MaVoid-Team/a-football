class PaymentVerificationJob < ApplicationJob
  queue_as :payments

  def perform(payment_id)
    payment = Payment.find_by(id: payment_id)
    return unless payment
    return unless payment.status == "pending"

    Rails.logger.info(
      "[PaymentVerification] Verifying payment ##{payment.id} " \
      "for booking ##{payment.booking_id} via #{payment.provider}"
    )
  end
end
