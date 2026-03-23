require "rails_helper"

RSpec.describe "Api::Admin::TournamentRegistrations", type: :request do
  let(:branch) { create(:branch) }
  let(:admin) { create(:admin, branch: branch) }
  let(:headers) { auth_headers(admin) }

  let(:tournament) { create(:tournament, branch: branch, created_by: admin) }
  let(:player) { create(:tournament_player, tournament: tournament, status: :pending) }
  let!(:registration) { create(:tournament_registration, tournament: tournament, player: player, status: :pending) }

  describe "PATCH /api/admin/registrations/:id" do
    it "approves registration" do
      expect(Tournaments::NotificationDispatcher).to receive(:dispatch).with(
        hash_including(
          event: :registration_status_changed,
          tournament: tournament,
          payload: hash_including(registration_id: registration.id, status: "approved", player_id: player.id)
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
