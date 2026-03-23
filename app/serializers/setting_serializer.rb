class SettingSerializer
  include JSONAPI::Serializer

  attributes :id, :branch_id, :whatsapp_number, :contact_email,
             :contact_phone, :opening_hour, :closing_hour,
             :booking_terms, :payment_number,
             :deposit_enabled, :deposit_percentage,
             :tournament_registration_admin_email,
             :send_registration_alerts_to_global_recipient,
             :created_at, :updated_at
end
