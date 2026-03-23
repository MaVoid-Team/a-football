require "rails_helper"

RSpec.describe "Api::Bookings", type: :request do
  describe "POST /api/bookings" do
    let(:branch) { create(:branch, active: true) }
    let(:court) { create(:court, branch: branch, price_per_hour: 150.00) }
    let(:user) { create(:user, name: "Player User", phone: "+201001111111") }

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
      post "/api/bookings", params: valid_params, headers: user_auth_headers(user)

      expect(response).to have_http_status(:created)
      data = JSON.parse(response.body)["data"]
      expect(data["attributes"]["status"]).to eq("confirmed")
      expect(data["attributes"]["total_price"]).to eq("300.0")
    end

    it "links booking to authenticated player account" do
      params = valid_params.deep_dup
      params[:booking].delete(:user_name)
      params[:booking].delete(:user_phone)

      post "/api/bookings", params: params, headers: user_auth_headers(user)

      expect(response).to have_http_status(:created)
      booking = Booking.order(:id).last
      expect(booking.user_id).to eq(user.id)
      expect(booking.user_name).to eq(user.name)
      expect(booking.user_phone).to eq(user.phone)
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

      post "/api/bookings", params: params, headers: user_auth_headers(user)

      expect(response).to have_http_status(:unprocessable_entity)
      errors = JSON.parse(response.body)["errors"]
      error_codes = JSON.parse(response.body)["error_codes"]
      expect(errors).to include("Minimum booking duration is 1 hour. Please select at least two adjacent 30-minute slots")
      expect(error_codes).to include("minimum_booking_duration")
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

      post "/api/bookings", params: params, headers: user_auth_headers(user)

      expect(response).to have_http_status(:unprocessable_entity)
      errors = JSON.parse(response.body)["errors"]
      error_codes = JSON.parse(response.body)["error_codes"]
      expect(errors).to include("Selected slots must be adjacent. Please remove gaps between selected times")
      expect(error_codes).to include("slots_not_adjacent")
    end

    it "returns errors for overlapping booking" do
      create(:booking, court: court, date: Date.tomorrow,
             start_time: "10:00", end_time: "12:00")

      post "/api/bookings", params: valid_params, headers: user_auth_headers(user)

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "returns errors for inactive branch" do
      branch.update!(active: false)
      post "/api/bookings", params: valid_params, headers: user_auth_headers(user)
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "applies promo discounts to booking total" do
      create(:promo_code, branch: branch, code: "SAVE10", discount_percentage: 10)
      params = valid_params.deep_dup
      params[:booking][:promo_code] = "SAVE10"

      post "/api/bookings", params: params, headers: user_auth_headers(user)

      expect(response).to have_http_status(:created)
      data = JSON.parse(response.body)["data"]["attributes"]
      expect(data["original_price"]).to eq("300.0")
      expect(data["discount_amount"]).to eq("30.0")
      expect(data["total_price"]).to eq("270.0")
    end

    it "returns an explicit error for invalid promo code" do
      params = valid_params.deep_dup
      params[:booking][:promo_code] = "NOTREAL"

      post "/api/bookings", params: params, headers: user_auth_headers(user)

      expect(response).to have_http_status(:unprocessable_entity)
      errors = JSON.parse(response.body)["errors"]
      error_codes = JSON.parse(response.body)["error_codes"]
      expect(errors).to include("Invalid promo code")
      expect(error_codes).to include("promo_code_invalid")
    end

    it "creates a deposit booking when branch deposit is enabled" do
      create(:setting, branch: branch, deposit_enabled: true, deposit_percentage: 30)
      params = valid_params.deep_dup
      params[:booking][:pay_deposit] = true

      post "/api/bookings", params: params, headers: user_auth_headers(user)

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

      post "/api/bookings", params: params, headers: user_auth_headers(user)

      expect(response).to have_http_status(:unprocessable_entity)
      errors = JSON.parse(response.body)["errors"]
      error_codes = JSON.parse(response.body)["error_codes"]
      expect(errors).to include("Deposit payment is not available for this branch")
      expect(error_codes).to include("deposit_unavailable_for_branch")
    end
  end

  describe "GET /api/me/bookings" do
    let(:branch) { create(:branch, active: true) }
    let(:court) { create(:court, branch: branch) }
    let(:user) { create(:user) }
    let(:other_user) { create(:user) }

    let!(:own_booking) do
      create(
        :booking,
        branch: branch,
        court: court,
        user: user,
        date: Date.tomorrow
      )
    end

    let!(:other_booking) do
      create(
        :booking,
        branch: branch,
        court: court,
        user: other_user,
        date: Date.tomorrow
      )
    end

    it "returns only bookings linked to current player" do
      get "/api/me/bookings", headers: user_auth_headers(user)

      expect(response).to have_http_status(:ok)
      ids = JSON.parse(response.body).fetch("data", []).map { |item| item["id"].to_i }
      expect(ids).to include(own_booking.id)
      expect(ids).not_to include(other_booking.id)
    end
  end
end
