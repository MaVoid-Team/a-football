class BranchSerializer
  include JSONAPI::Serializer

  attributes :id, :name, :address, :timezone, :active, :created_at, :updated_at
end
