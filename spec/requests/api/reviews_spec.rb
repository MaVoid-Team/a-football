require "rails_helper"

RSpec.describe "Api::Reviews", type: :request do
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
      user_name: user.name,
      user_phone: user.phone,
      date: Date.tomorrow,
      status: :confirmed
    )
  end

  let!(:other_booking) do
    create(
      :booking,
      branch: branch,
      court: court,
      user: other_user,
      user_name: other_user.name,
      user_phone: other_user.phone,
      date: Date.tomorrow,
      status: :confirmed
    )
  end

  describe "GET /api/reviews" do
    it "is public and returns reviews for a court" do
      get "/api/reviews", params: { court_id: court.id }

      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /api/reviews" do
    let(:payload) do
      {
        review: {
          booking_id: own_booking.id,
          rating: 5,
          body: "Great experience"
        }
      }
    end

    it "requires authentication" do
      post "/api/reviews", params: payload

      expect(response).to have_http_status(:unauthorized)
    end

    it "creates a review for the current user booking" do
      post "/api/reviews", params: payload, headers: user_auth_headers(user)

      expect(response).to have_http_status(:created)
      expect(Review.where(booking_id: own_booking.id).count).to eq(1)
    end

    it "rejects reviewing another user's booking" do
      post "/api/reviews",
           params: { review: { booking_id: other_booking.id, rating: 4, body: "ok" } },
           headers: user_auth_headers(user)

      expect(response).to have_http_status(:not_found)
      expect(JSON.parse(response.body)["error"]).to eq("Booking not found for current user")
    end
  end
end