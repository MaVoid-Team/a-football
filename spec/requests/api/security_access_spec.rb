require "rails_helper"

RSpec.describe "Api::SecurityAccess", type: :request do
  describe "public routes" do
    it "allows package listing without authentication" do
      get "/api/packages"

      expect(response).to have_http_status(:ok)
    end

    it "allows tournament listing without authentication" do
      get "/api/tournaments"

      expect(response).to have_http_status(:ok)
    end
  end

  describe "protected routes" do
    it "blocks package request creation without authentication" do
      post "/api/package_requests", params: {
        package_request: {
          package_id: 1,
          branch_id: 1,
          customer_name: "Guest",
          customer_email: "guest@example.com",
          customer_phone: "+201000000000"
        }
      }

      expect(response).to have_http_status(:unauthorized)
      expect(JSON.parse(response.body)["error"]).to eq("User authentication required")
    end
  end
end