class PackageSerializer
  include JSONAPI::Serializer

  attributes :id, :branch_id, :title, :description, :price, :created_at, :updated_at
end
