class UserTeamSerializer
  include JSONAPI::Serializer

  attributes :id, :name, :teammate_name, :teammate_phone, :teammate_email,
             :teammate_skill_level, :created_at, :updated_at
end
