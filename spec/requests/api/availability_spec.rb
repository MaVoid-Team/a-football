require "rails_helper"

RSpec.describe "Api::Availability", type: :request do
  describe "GET /api/availability" do
    let(:branch) { create(:branch, active: true) }
    let(:court) { create(:court, branch: branch) }

    it "returns available slots" do
      get "/api/availability", params: {
        branch_id: branch.id,
        court_id: court.id,
        date: Date.tomorrow.to_s
      }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["available_slots"]).to be_an(Array)
      expect(json["available_slots"].length).to eq(15)
    end

    it "excludes booked slots" do
      create(:booking, court: court, date: Date.tomorrow,
             start_time: "10:00", end_time: "11:00")

      get "/api/availability", params: {
        branch_id: branch.id,
        court_id: court.id,
        date: Date.tomorrow.to_s
      }

      json = JSON.parse(response.body)
      times = json["available_slots"].map { |s| s["start_time"] }
      expect(times).not_to include("10:00")
    end
  end
end
