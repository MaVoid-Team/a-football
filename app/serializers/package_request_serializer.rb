class PackageRequestSerializer
  include JSONAPI::Serializer

  attributes :id, :customer_name, :customer_email, :customer_phone, :special_needs, :status, :created_at, :updated_at
  belongs_to :package
  belongs_to :branch
end
