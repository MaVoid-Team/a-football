class EventSerializer
  include JSONAPI::Serializer

  attributes :id, :branch_id, :title, :description, :start_date,
             :participation_price, :max_participants, :created_at, :updated_at

  attribute :remaining_spots do |event|
    event.remaining_spots
  end

  attribute :whatsapp_redirect_link do |event|
    event.whatsapp_redirect_link
  end
end
