class UserSerializer
  include JSONAPI::Serializer

  attributes :id, :name, :phone, :email, :skill_level, :created_at, :updated_at
end
