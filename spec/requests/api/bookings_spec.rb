require "rails_helper"

RSpec.describe "Api::Bookings", type: :request do
  describe "POST /api/bookings" do
    let(:branch) { create(:branch, active: true) }
    let(:court) { create(:court, branch: branch, price_per_hour: 150.00) }

    let(:valid_params) do
      {
        branch_id: branch.id,
        booking: {
          court_id: court.id,
          user_name: "Test User",
          user_phone: "+201001234567",
          date: Date.tomorrow.to_s,
          start_time: "10:00",
          end_time: "12:00"
        }
      }
    end

    it "creates a booking" do
      post "/api/bookings", params: valid_params

      expect(response).to have_http_status(:created)
      data = JSON.parse(response.body)["data"]
      expect(data["attributes"]["status"]).to eq("confirmed")
      expect(data["attributes"]["total_price"]).to eq("300.0")
    end

    it "rejects booking with a single 30-minute slot" do
      params = {
        branch_id: branch.id,
        booking: {
          court_id: court.id,
          user_name: "Test User",
          user_phone: "+201001234567",
          date: Date.tomorrow.to_s,
          booking_slots_attributes: [
            { start_time: "10:00", end_time: "10:30" }
          ]
        }
      }

      post "/api/bookings", params: params

      expect(response).to have_http_status(:unprocessable_entity)
      errors = JSON.parse(response.body)["errors"]
      expect(errors).to include("Minimum booking duration is 1 hour. Please select at least two adjacent 30-minute slots")
    end

    it "rejects non-adjacent half-hour selections" do
      params = {
        branch_id: branch.id,
        booking: {
          court_id: court.id,
          user_name: "Test User",
          user_phone: "+201001234567",
          date: Date.tomorrow.to_s,
          booking_slots_attributes: [
            { start_time: "10:00", end_time: "10:30" },
            { start_time: "14:00", end_time: "14:30" }
          ]
        }
      }

      post "/api/bookings", params: params

      expect(response).to have_http_status(:unprocessable_entity)
      errors = JSON.parse(response.body)["errors"]
      expect(errors).to include("Selected slots must be adjacent. Please remove gaps between selected times")
    end

    it "returns errors for overlapping booking" do
      create(:booking, court: court, date: Date.tomorrow,
             start_time: "10:00", end_time: "12:00")

      post "/api/bookings", params: valid_params

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "returns errors for inactive branch" do
      branch.update!(active: false)
      post "/api/bookings", params: valid_params
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
