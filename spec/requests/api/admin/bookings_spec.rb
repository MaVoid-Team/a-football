require "rails_helper"

RSpec.describe "Api::Admin::Bookings", type: :request do
  let(:branch) { create(:branch) }
  let(:admin) { create(:admin, :super_admin) }
  let(:headers) { auth_headers(admin) }
  let(:court) { create(:court, branch: branch) }

  describe "GET /api/admin/bookings" do
    it "returns all bookings" do
      create_list(:booking, 3, court: court)

      get "/api/admin/bookings", headers: headers

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)["data"]
      expect(data.length).to eq(3)
    end

    it "filters by status" do
      create(:booking, court: court, status: :confirmed)
      create(:booking, court: court, date: Date.tomorrow,
             start_time: "14:00", end_time: "15:00", status: :cancelled)

      get "/api/admin/bookings", params: { status: "confirmed" }, headers: headers

      data = JSON.parse(response.body)["data"]
      expect(data.length).to eq(1)
    end
  end

  describe "PATCH /api/admin/bookings/:id (cancel)" do
    it "cancels a booking" do
      booking = create(:booking, court: court)

      patch "/api/admin/bookings/#{booking.id}", params: { cancel: true }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(booking.reload.status).to eq("cancelled")
    end
  end
end
