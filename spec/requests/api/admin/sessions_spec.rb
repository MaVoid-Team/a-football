require "rails_helper"

RSpec.describe "Api::Admin::Sessions", type: :request do
  describe "POST /api/admin/login" do
    let!(:admin) { create(:admin, email: "admin@test.com", password: "password123") }

    it "returns a JWT token with valid credentials" do
      post "/api/admin/login", params: { email: "admin@test.com", password: "password123" }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["token"]).to be_present
      expect(json["admin"]["data"]["attributes"]["email"]).to eq("admin@test.com")
    end

    it "returns unauthorized with invalid credentials" do
      post "/api/admin/login", params: { email: "admin@test.com", password: "wrong" }

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
