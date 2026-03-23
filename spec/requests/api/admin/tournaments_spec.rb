require "rails_helper"

RSpec.describe "Api::Admin::Tournaments", type: :request do
  let(:branch) { create(:branch) }
  let(:admin) { create(:admin, branch: branch) }
  let(:headers) { auth_headers(admin) }

  describe "POST /api/admin/tournaments" do
    it "defaults status to open when omitted" do
      post "/api/admin/tournaments",
           params: {
             tournament: {
               branch_id: branch.id,
               name: "Community Cup",
               tournament_type: "knockout",
               max_players: 16,
               start_date: 10.days.from_now,
               registration_deadline: 5.days.from_now,
               match_duration_minutes: 60
             }
           },
           headers: headers

      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body.dig("data", "attributes", "status")).to eq("open")
    end
  end

  describe "POST /api/admin/tournaments/:id/start" do
    it "starts tournament when status is open and bracket exists" do
      tournament = create(
        :tournament,
        branch: branch,
        created_by: admin,
        status: :open,
        bracket_data: {
          "rounds" => [
            {
              "round_number" => 1,
              "matches" => []
            }
          ]
        }
      )

      post "/api/admin/tournaments/#{tournament.id}/start", headers: headers

      expect(response).to have_http_status(:ok)
      tournament.reload
      expect(tournament.status).to eq("ongoing")
    end

    it "rejects starting tournament from completed status" do
      tournament = create(
        :tournament,
        branch: branch,
        created_by: admin,
        status: :completed,
        bracket_data: {
          "rounds" => [
            {
              "round_number" => 1,
              "matches" => []
            }
          ]
        }
      )

      post "/api/admin/tournaments/#{tournament.id}/start", headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
      body = JSON.parse(response.body)
      expect(body["error_codes"]).to include("invalid_state")
      tournament.reload
      expect(tournament.status).to eq("completed")
    end
  end

  describe "GET /api/admin/tournaments/:id/bracket" do
    it "returns bracket in a JSON:API-style envelope" do
      tournament = create(
        :tournament,
        branch: branch,
        created_by: admin,
        status: :open,
        bracket_data: {
          "rounds" => [
            {
              "round_number" => 1,
              "matches" => []
            }
          ]
        }
      )

      get "/api/admin/tournaments/#{tournament.id}/bracket", headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.dig("data", "id")).to eq(tournament.id.to_s)
      expect(body.dig("data", "type")).to eq("tournament_brackets")
      expect(body.dig("data", "attributes", "tournament_id")).to eq(tournament.id)
      expect(body.dig("data", "attributes", "bracket", "rounds")).to be_an(Array)
    end
  end
end
