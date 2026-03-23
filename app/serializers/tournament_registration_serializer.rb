class TournamentRegistrationSerializer
  include JSONAPI::Serializer

  attributes :id, :tournament_id, :player_id, :team_id, :approved_by_id,
             :status, :refund_status, :notes, :created_at, :updated_at

  attribute :player_name do |registration|
    registration.player&.name
  end

  attribute :player_phone do |registration|
    registration.player&.phone
  end

  attribute :player_email do |registration|
    registration.player&.email
  end

  attribute :player_skill_level do |registration|
    registration.player&.skill_level
  end
end
