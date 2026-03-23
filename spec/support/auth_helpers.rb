module AuthHelpers
  def auth_headers(admin)
    token = Auth::JsonWebToken.encode(admin_id: admin.id)
    { "Authorization" => "Bearer #{token}" }
  end

  def user_auth_headers(user)
    token = Auth::JsonWebToken.encode(user_id: user.id)
    { "Authorization" => "Bearer #{token}" }
  end
end

RSpec.configure do |config|
  config.include AuthHelpers, type: :request
end
