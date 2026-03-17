class PaymentSerializer
  include JSONAPI::Serializer

  attributes :id, :booking_id, :provider, :status, :transaction_id,
             :amount, :created_at, :updated_at
end
