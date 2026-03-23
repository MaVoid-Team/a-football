require "rails_helper"

RSpec.describe "Api::Tournaments", type: :request do
  describe "GET /api/tournaments/:id" do
    let(:branch) { create(:branch, active: true) }

    it "hides draft tournaments from public show endpoint" do
      tournament = create(:tournament, branch: branch, status: :draft)

      get "/api/tournaments/#{tournament.id}"

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/tournaments/:id/register" do
    let(:branch) { create(:branch, active: true) }
    let(:tournament) { create(:tournament, branch: branch, max_players: 2, registration_deadline: 1.day.from_now, status: :open) }

    let(:params) do
      {
        registration: {
          name: "Player One",
          phone: "+201001234567",
          skill_level: "intermediate"
        }
      }
    end

    it "creates pending registration" do
      post "/api/tournaments/#{tournament.id}/register", params: params

      expect(response).to have_http_status(:created)
      data = JSON.parse(response.body)["data"]
      expect(data["attributes"]["status"]).to eq("pending")
      expect(tournament.tournament_players.count).to eq(1)
      expect(tournament.tournament_registrations.count).to eq(1)
    end

    it "rejects registration when deadline passed" do
      tournament.update!(registration_deadline: 1.day.ago)

      post "/api/tournaments/#{tournament.id}/register", params: params

      expect(response).to have_http_status(:unprocessable_entity)
      body = JSON.parse(response.body)
      expect(body["error_codes"]).to include("registration_closed")
    end

    it "rejects duplicate registration" do
      post "/api/tournaments/#{tournament.id}/register", params: params
      post "/api/tournaments/#{tournament.id}/register", params: params

      expect(response).to have_http_status(:unprocessable_entity)
      body = JSON.parse(response.body)
      expect(body["error_codes"]).to include("already_registered")
    end

    it "rejects registration when tournament is full" do
      p1 = create(:tournament_player, tournament: tournament, status: :approved)
      p2 = create(:tournament_player, tournament: tournament, status: :approved)
      create(:tournament_registration, tournament: tournament, player: p1, status: :approved)
      create(:tournament_registration, tournament: tournament, player: p2, status: :approved)

      post "/api/tournaments/#{tournament.id}/register", params: {
        registration: {
          name: "Late Player",
          phone: "+201009999999",
          skill_level: "beginner"
        }
      }

      expect(response).to have_http_status(:unprocessable_entity)
      body = JSON.parse(response.body)
      expect(body["error_codes"]).to include("tournament_full")
    end
  end
end
