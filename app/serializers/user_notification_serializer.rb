class UserNotificationSerializer
  include JSONAPI::Serializer

  attributes :id, :notification_type, :title, :body, :link_url, :data,
             :read_at, :created_at, :updated_at

  attribute :read do |notification|
    notification.read?
  end
end
