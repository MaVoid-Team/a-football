Rack::Attack.cache.store = ActiveSupport::Cache::RedisCacheStore.new(
  url: ENV.fetch("REDIS_URL", "redis://localhost:6379/0")
)

Rack::Attack.throttle("login", limit: 5, period: 60.seconds) do |req|
  req.ip if req.path == "/api/admin/login" && req.post?
end

Rack::Attack.throttle("bookings/create", limit: 10, period: 60.seconds) do |req|
  req.ip if req.path == "/api/bookings" && req.post?
end

Rack::Attack.throttle("tournaments/register", limit: 10, period: 60.seconds) do |req|
  req.ip if req.path.match?(%r{\A/api/tournaments/\d+/register\z}) && req.post?
end

Rack::Attack.throttle("api/general", limit: 300, period: 60.seconds) do |req|
  req.ip if req.path.start_with?("/api")
end

Rack::Attack.throttled_responder = lambda do |_request|
  [429, { "Content-Type" => "application/json" }, [{ error: "Rate limit exceeded. Please try again later." }.to_json]]
end
