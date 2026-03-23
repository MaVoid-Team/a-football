Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    allowed_origins = ENV
      .fetch("CORS_ORIGINS", "http://localhost:3000,http://localhost:3095")
      .split(",")
      .map(&:strip)
      .reject(&:blank?)

    origins(*allowed_origins)

    resource "*",
      headers: :any,
      methods: %i[get post put patch delete options head],
      credentials: false,
      expose: %w[Authorization X-Total-Count X-Page X-Per-Page X-Total-Pages]
  end
end
