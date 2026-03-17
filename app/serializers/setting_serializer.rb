class SettingSerializer
  include JSONAPI::Serializer

  attributes :id, :branch_id, :whatsapp_number, :contact_email,
             :contact_phone, :opening_hour, :closing_hour,
             :booking_terms, :payment_number, :created_at, :updated_at
end
