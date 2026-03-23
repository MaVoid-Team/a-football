require "rails_helper"

RSpec.describe "Api::PromoCodes", type: :request do
  describe "POST /api/branches/:branch_id/promo_codes/validate" do
    let(:branch) { create(:branch, active: true) }
    let(:court) { create(:court, branch: branch, price_per_hour: 100.0) }
    let!(:promo_code) { create(:promo_code, branch: branch, code: "SAVE10", discount_percentage: 10) }

    it "validates promo using server-side slot pricing" do
      create(:court_hourly_rate, court: court, start_hour: 10, end_hour: 12, price_per_hour: 150.0)

      post "/api/branches/#{branch.id}/promo_codes/validate", params: {
        code: "SAVE10",
        court_id: court.id,
        booking_slots_attributes: [
          { start_time: "10:00", end_time: "10:30" },
          { start_time: "10:30", end_time: "11:00" }
        ]
      }

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["valid"]).to eq(true)
      expect(body.dig("promo_code", "code")).to eq("SAVE10")
      expect(body["validated_total_amount"]).to eq(150.0)
      expect(body["discount_amount"]).to eq(15.0)
      expect(body["final_amount"]).to eq(135.0)
    end

    it "returns invalid when promo code does not exist" do
      post "/api/branches/#{branch.id}/promo_codes/validate", params: {
        code: "BADCODE",
        total_amount: 200
      }

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["valid"]).to eq(false)
      expect(body["error"]).to eq("Invalid promo code")
    end

    it "returns invalid for non-applicable promo codes" do
      promo_code.update!(minimum_amount: 500)

      post "/api/branches/#{branch.id}/promo_codes/validate", params: {
        code: "SAVE10",
        total_amount: 200
      }

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["valid"]).to eq(false)
      expect(body["error"]).to eq("Promo code is not applicable")
    end
  end
end
