class BlockedSlotSerializer
  include JSONAPI::Serializer

  attributes :id, :branch_id, :court_id, :date, :reason, :created_at, :updated_at

  attribute :start_time do |slot|
    slot.start_time&.strftime("%H:%M")
  end

  attribute :end_time do |slot|
    slot.end_time&.strftime("%H:%M")
  end
end
