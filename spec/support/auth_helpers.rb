module AuthHelpers
  def auth_headers(admin)
    token = Auth::JsonWebToken.encode(admin_id: admin.id)
    { "Authorization" => "Bearer #{token}" }
  end
end

RSpec.configure do |config|
  config.include AuthHelpers, type: :request
end
