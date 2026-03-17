module Payments
  class WebhookHandler
    def initialize(payload:, signature: nil)
      @payload = payload
      @signature = signature
    end

    def call
      return ServiceResult.failure("Invalid webhook signature") unless valid_signature?

      transaction_id = @payload[:transaction_id]
      status = @payload[:status]

      payment = Payment.find_by(transaction_id: transaction_id)
      return ServiceResult.failure("Payment not found") unless payment

      ActiveRecord::Base.transaction do
        payment.update!(
          status: status,
          raw_payload: @payload
        )

        case status
        when "paid", "success"
          payment.booking.paid!
        when "failed"
          payment.booking.failed!
        end
      end

      ServiceResult.success(payment.reload)
    rescue ActiveRecord::RecordInvalid => e
      ServiceResult.failure(e.record.errors.full_messages)
    end

    private

    def valid_signature?
      secret = Rails.application.credentials.dig(:payments, :webhook_secret)
      return true unless secret

      expected = OpenSSL::HMAC.hexdigest("SHA256", secret, @payload.to_json)
      ActiveSupport::SecurityUtils.secure_compare(expected, @signature.to_s)
    end
  end
end
