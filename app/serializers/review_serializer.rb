class ReviewSerializer
  include JSONAPI::Serializer

  attributes :id, :booking_id, :court_id, :branch_id,
             :reviewer_name, :rating, :body, :created_at, :updated_at
end
