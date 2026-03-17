class PerkSerializer
  include JSONAPI::Serializer

  attributes :id, :court_id, :name, :description, :active, :position, :created_at, :updated_at
end
