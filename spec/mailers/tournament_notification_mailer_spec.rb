require "rails_helper"

RSpec.describe TournamentNotificationMailer, type: :mailer do
  describe "#event_notification" do
    let(:branch) { create(:branch, name: "Nasr City") }
    let(:tournament) { create(:tournament, branch: branch, name: "Spring Cup") }

    it "renders registration-created email content" do
      mail = described_class.with(
        event: "tournament_registration_created",
        tournament: tournament,
        recipient: "alerts@example.com",
        payload: {
          registration_id: 12,
          player_name: "Player One",
          player_phone: "+201001234567",
          player_email: "player@example.com",
          player_skill_level: "advanced",
          status: "pending",
          branch_name: branch.name,
          moderation_url: "https://admin.example.com/en/tournaments/#{tournament.id}?tab=participants"
        }
      ).event_notification

      expect(mail.subject).to eq("Tournament Update: Spring Cup - New Registration Pending Review")
      expect(mail.body.encoded).to include("Branch: Nasr City")
      expect(mail.body.encoded).to include("Player Email: player@example.com")
      expect(mail.body.encoded).to include("Skill Level: advanced")
      expect(mail.body.encoded).to include("Moderation Link: https://admin.example.com/en/tournaments/#{tournament.id}?tab=participants")
    end

    it "renders registration-status email content" do
      mail = described_class.with(
        event: "registration_status_changed",
        tournament: tournament,
        recipient: "alerts@example.com",
        payload: {
          registration_id: 12,
          player_id: 44,
          player_name: "Player One",
          player_phone: "+201001234567",
          player_email: "player@example.com",
          status: "approved",
          branch_name: branch.name,
          moderation_url: "https://admin.example.com/en/tournaments/#{tournament.id}?tab=participants"
        }
      ).event_notification

      expect(mail.subject).to eq("Tournament Update: Spring Cup - Registration Approved")
      expect(mail.body.encoded).to include("New Status: Approved")
      expect(mail.body.encoded).to include("Player Phone: +201001234567")
      expect(mail.body.encoded).to include("Moderation Link: https://admin.example.com/en/tournaments/#{tournament.id}?tab=participants")
    end
  end
end
