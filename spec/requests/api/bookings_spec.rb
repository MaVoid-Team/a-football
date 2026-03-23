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

    it "applies promo discounts to booking total" do
      create(:promo_code, branch: branch, code: "SAVE10", discount_percentage: 10)
      params = valid_params.deep_dup
      params[:booking][:promo_code] = "SAVE10"

      post "/api/bookings", params: params

      expect(response).to have_http_status(:created)
      data = JSON.parse(response.body)["data"]["attributes"]
      expect(data["original_price"]).to eq("300.0")
      expect(data["discount_amount"]).to eq("30.0")
      expect(data["total_price"]).to eq("270.0")
    end

    it "returns an explicit error for invalid promo code" do
      params = valid_params.deep_dup
      params[:booking][:promo_code] = "NOTREAL"

      post "/api/bookings", params: params

      expect(response).to have_http_status(:unprocessable_entity)
      errors = JSON.parse(response.body)["errors"]
      expect(errors).to include("Invalid promo code")
    end

    it "creates a deposit booking when branch deposit is enabled" do
      create(:setting, branch: branch, deposit_enabled: true, deposit_percentage: 30)
      params = valid_params.deep_dup
      params[:booking][:pay_deposit] = true

      post "/api/bookings", params: params

      expect(response).to have_http_status(:created)
      data = JSON.parse(response.body)["data"]["attributes"]
      expect(data["payment_option"]).to eq("deposit")
      expect(data["deposit_percentage_snapshot"]).to eq("30.0")
      expect(data["amount_due_now"]).to eq("90.0")
      expect(data["amount_remaining"]).to eq("210.0")
    end

    it "rejects deposit booking when branch deposit is disabled" do
      create(:setting, branch: branch, deposit_enabled: false, deposit_percentage: 30)
      params = valid_params.deep_dup
      params[:booking][:pay_deposit] = true

      post "/api/bookings", params: params

      expect(response).to have_http_status(:unprocessable_entity)
      errors = JSON.parse(response.body)["errors"]
      expect(errors).to include("Deposit payment is not available for this branch")
    end
  end
end
