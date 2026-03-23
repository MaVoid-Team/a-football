require "rails_helper"

RSpec.describe "Api::Auth", type: :request do
  describe "POST /api/auth/register" do
    it "creates a player account and returns a token" do
      post "/api/auth/register", params: {
        user: {
          name: "Player User",
          phone: "+201012345678",
          email: "player@example.com",
          password: "password123",
          skill_level: "advanced"
        }
      }

      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body["token"]).to be_present
      expect(body.dig("user", "data", "attributes", "email")).to eq("player@example.com")
    end
  end

  describe "POST /api/auth/login" do
    let!(:user) { create(:user, email: "login@example.com", password: "password123") }

    it "logs in a player" do
      post "/api/auth/login", params: { email: user.email, password: "password123" }

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["token"]).to be_present
      expect(body.dig("user", "data", "attributes", "email")).to eq(user.email)
    end
  end

  describe "GET /api/me/profile" do
    let(:user) { create(:user) }

    it "requires player authentication" do
      get "/api/me/profile"

      expect(response).to have_http_status(:unauthorized)
    end

    it "returns the current player profile" do
      get "/api/me/profile", headers: user_auth_headers(user)

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.dig("data", "attributes", "email")).to eq(user.email)
    end
  end
end
