require "rails_helper"

RSpec.describe TournamentEventNotificationJob, type: :job do
  describe "#perform" do
    let(:branch) { create(:branch) }
    let(:tournament) { create(:tournament, branch: branch) }
    let!(:branch_admin) { create(:admin, :branch_admin, branch: branch) }
    let!(:super_admin) { create(:admin, :super_admin) }

    it "logs tournament notification event" do
      expect(Rails.logger).to receive(:info).with(include("[TournamentNotification]", "event=match_scored", "tournament_id=#{tournament.id}"))

      described_class.new.perform("match_scored", tournament.id, { "match_id" => 1 })
    end

    it "returns silently when tournament is missing" do
      expect { described_class.new.perform("match_scored", 999_999, {}) }.not_to raise_error
    end

    it "sends email notifications when email channel is enabled" do
      allow(ENV).to receive(:fetch).with("TOURNAMENT_NOTIFICATION_CHANNELS", "log").and_return("log,email")

      mail_delivery = instance_double(ActionMailer::MessageDelivery)
      allow(mail_delivery).to receive(:deliver_later)

      expect(TournamentNotificationMailer).to receive(:with).with(
        hash_including(event: "match_scored", tournament: tournament, payload: { "match_id" => 1 }, recipient: branch_admin.email)
      ).and_return(double(event_notification: mail_delivery))

      expect(TournamentNotificationMailer).to receive(:with).with(
        hash_including(event: "match_scored", tournament: tournament, payload: { "match_id" => 1 }, recipient: super_admin.email)
      ).and_return(double(event_notification: mail_delivery))

      described_class.new.perform("match_scored", tournament.id, { "match_id" => 1 })
    end
  end
end
