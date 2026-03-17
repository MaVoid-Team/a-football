class AdminSerializer
  include JSONAPI::Serializer

  attributes :id, :email, :role, :branch_id, :created_at, :updated_at
end
