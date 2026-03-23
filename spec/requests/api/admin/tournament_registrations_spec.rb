require "rails_helper"

RSpec.describe "Api::Admin::TournamentRegistrations", type: :request do
  let(:branch) { create(:branch) }
  let(:admin) { create(:admin, branch: branch) }
  let(:headers) { auth_headers(admin) }

  let(:tournament) { create(:tournament, branch: branch, created_by: admin) }
  let(:player) { create(:tournament_player, tournament: tournament, status: :pending) }
  let!(:registration) { create(:tournament_registration, tournament: tournament, player: player, status: :pending) }
  let!(:approved_registration) do
    create(
      :tournament_registration,
      tournament: tournament,
      player: create(:tournament_player, tournament: tournament, status: :approved, email: "approved@example.com"),
      status: :approved
    )
  end

  describe "GET /api/admin/tournaments/:tournament_id/registrations" do
    it "returns registrations with moderation fields" do
      get "/api/admin/tournaments/#{tournament.id}/registrations", headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      payload = body.fetch("data").find { |item| item["id"] == registration.id.to_s }

      expect(payload.dig("attributes", "player_name")).to eq(player.name)
      expect(payload.dig("attributes", "player_phone")).to eq(player.phone)
      expect(payload.dig("attributes", "player_email")).to eq(player.email)
      expect(payload.dig("attributes", "player_skill_level")).to eq(player.skill_level)
      expect(payload.dig("attributes", "status")).to eq("pending")
      expect(payload.dig("attributes", "created_at")).to be_present
      expect(payload.dig("attributes", "notes")).to be_nil
    end

    it "filters registrations by status" do
      get "/api/admin/tournaments/#{tournament.id}/registrations", params: { status: "approved" }, headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.fetch("data").length).to eq(1)
      expect(body.dig("data", 0, "id")).to eq(approved_registration.id.to_s)
      expect(body.dig("data", 0, "attributes", "status")).to eq("approved")
    end
  end

  describe "PATCH /api/admin/registrations/:id" do
    it "approves registration" do
      allow(ENV).to receive(:fetch).with("ADMIN_APP_URL", "").and_return("https://admin.example.com")

      expect(Tournaments::NotificationDispatcher).to receive(:dispatch).with(
        hash_including(
          event: :registration_status_changed,
          tournament: tournament,
          payload: hash_including(
            registration_id: registration.id,
            status: "approved",
            player_id: player.id,
            player_email: player.email,
            branch_name: branch.name,
            moderation_url: "https://admin.example.com/en/tournaments/#{tournament.id}?tab=participants"
          )
        )
      )

      patch "/api/admin/registrations/#{registration.id}",
            params: { registration: { status: "approved", notes: "approved by admin" } },
            headers: headers

      expect(response).to have_http_status(:ok)
      registration.reload
      player.reload
      expect(registration.status).to eq("approved")
      expect(player.status).to eq("approved")
      expect(registration.approved_by_id).to eq(admin.id)
    end

    it "rejects registration" do
      expect(Tournaments::NotificationDispatcher).to receive(:dispatch).with(
        hash_including(
          event: :registration_status_changed,
          payload: hash_including(status: "rejected", player_email: player.email)
        )
      )

      patch "/api/admin/registrations/#{registration.id}",
            params: { registration: { status: "rejected", notes: "not eligible" } },
            headers: headers

      expect(response).to have_http_status(:ok)
      registration.reload
      player.reload
      expect(registration.status).to eq("rejected")
      expect(player.status).to eq("rejected")
    end

    it "cancels registration and sets refund status" do
      expect(Tournaments::NotificationDispatcher).to receive(:dispatch).with(
        hash_including(
          event: :registration_status_changed,
          payload: hash_including(status: "cancelled", refund_status: "eligible")
        )
      )

      patch "/api/admin/registrations/#{registration.id}",
            params: { registration: { status: "cancelled", refund_status: "eligible" } },
            headers: headers

      expect(response).to have_http_status(:ok)
      registration.reload
      player.reload
      expect(registration.status).to eq("cancelled")
      expect(registration.refund_status).to eq("eligible")
      expect(player.status).to eq("cancelled")
    end
  end
end
