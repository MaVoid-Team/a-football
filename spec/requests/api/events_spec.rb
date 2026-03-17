require "rails_helper"

RSpec.describe "Api::Events", type: :request do
  describe "GET /api/events" do
    let(:branch) { create(:branch) }

    before do
      create(:setting, branch: branch, whatsapp_number: "201234567890")
      create(:event, branch: branch, title: "Test Event", max_participants: 20)
    end

    it "returns events with computed fields" do
      get "/api/events", params: { branch_id: branch.id }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)["data"]
      expect(data.length).to eq(1)
      attrs = data.first["attributes"]
      expect(attrs["remaining_spots"]).to eq(20)
      expect(attrs["whatsapp_redirect_link"]).to include("wa.me/201234567890")
    end
  end

  describe "GET /api/events/:id" do
    it "returns a single event" do
      branch = create(:branch)
      create(:setting, branch: branch, whatsapp_number: "123")
      event = create(:event, branch: branch)

      get "/api/events/#{event.id}"

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)["data"]
      expect(data["id"]).to eq(event.id.to_s)
    end
  end
end
