require "rails_helper"

RSpec.describe "Api::Me::Tournaments", type: :request do
  let(:branch) { create(:branch, active: true) }
  let(:user) { create(:user, name: "Tracked User", phone: "+201055555555", email: "tracked@example.com") }
  let(:tournament) { create(:tournament, branch: branch, max_players: 8, registration_deadline: 1.day.from_now, status: :open) }

  describe "GET /api/me/tournaments/:id" do
    it "returns the current player's participation" do
      player = create(:tournament_player, tournament: tournament, user: user, status: :approved)
      create(:tournament_registration, tournament: tournament, player: player, status: :approved)

      get "/api/me/tournaments/#{tournament.id}", headers: user_auth_headers(user)

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.dig("data", "attributes", "tournament_name")).to eq(tournament.name)
      expect(body.dig("data", "attributes", "participation_status")).to eq("approved")
    end
  end
end
