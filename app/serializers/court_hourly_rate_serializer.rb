class CourtHourlyRateSerializer
  include JSONAPI::Serializer

  attributes :id, :court_id, :start_hour, :end_hour, :price_per_hour, :active, :created_at, :updated_at
end
