class PromoCodeSerializer
  include JSONAPI::Serializer

  attributes :id, :code, :description, :discount_percentage, :discount_amount, 
             :minimum_amount, :usage_limit, :used_count, :starts_at, :expires_at, 
             :active, :created_at, :updated_at
  
  belongs_to :branch
end
