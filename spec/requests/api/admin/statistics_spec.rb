require "rails_helper"

RSpec.describe "Api::Admin::Statistics", type: :request do
  let(:branch) { create(:branch) }
  let(:admin) { create(:admin, :super_admin) }
  let(:headers) { auth_headers(admin) }
  let(:court) { create(:court, branch: branch) }

  describe "GET /api/admin/statistics" do
    let(:court2) { create(:court, branch: branch) }

    before do
      create(:booking, court: court, status: :confirmed, payment_status: :paid, total_price: 150)
      create(:booking, court: court2, status: :confirmed, payment_status: :paid, total_price: 200)
          create(:booking,
            court: court,
            date: Date.tomorrow + 2,
            start_time: "18:00",
            end_time: "19:00",
            status: :confirmed,
            payment_status: :pending,
            total_price: 200,
            payment_option: :deposit,
            amount_due_now: 60,
            amount_remaining: 140)
      create(:booking, court: court, date: Date.tomorrow + 1,
             start_time: "16:00", end_time: "17:00",
             status: :cancelled, payment_status: :pending, total_price: 100)
    end

    it "returns statistics" do
      get "/api/admin/statistics", headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json["total_revenue"]).to eq("350.0")
      expect(json["collected_due_now"]).to eq("410.0")
      expect(json["outstanding_balance"]).to eq("140.0")
      expect(json["total_confirmed_bookings"]).to eq(3)
      expect(json["bookings_per_court"]).to be_an(Array)
      expect(json["occupancy_rate_percent"]).to be_a(Numeric)
    end
  end
end
