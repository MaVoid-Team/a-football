class TournamentRegistrationSerializer
  include JSONAPI::Serializer

  attributes :id, :tournament_id, :player_id, :team_id, :approved_by_id,
             :status, :refund_status, :notes, :created_at, :updated_at
end
