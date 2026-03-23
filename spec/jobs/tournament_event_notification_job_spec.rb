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

    it "uses only branch and conditional global recipients for registration-created alerts" do
      allow(ENV).to receive(:fetch).with("TOURNAMENT_NOTIFICATION_CHANNELS", "log").and_return("email")
      create(
        :setting,
        branch: branch,
        tournament_registration_admin_email: " BranchAlerts@example.com ",
        send_registration_alerts_to_global_recipient: true
      )

      mail_delivery = instance_double(ActionMailer::MessageDelivery, deliver_later: true)
      allow(TournamentNotificationMailer).to receive(:with).and_return(double(event_notification: mail_delivery))

      described_class.new.perform("tournament_registration_created", tournament.id, { "registration_id" => 1 })

      expect(TournamentNotificationMailer).to have_received(:with).with(
        hash_including(event: "tournament_registration_created", recipient: "branchalerts@example.com")
      )
      expect(TournamentNotificationMailer).to have_received(:with).with(
        hash_including(event: "tournament_registration_created", recipient: "z.ahmed@mavoid.com")
      )
      expect(TournamentNotificationMailer).not_to have_received(:with).with(
        hash_including(event: "tournament_registration_created", recipient: branch_admin.email)
      )
      expect(TournamentNotificationMailer).not_to have_received(:with).with(
        hash_including(event: "tournament_registration_created", recipient: super_admin.email)
      )
    end

    it "deduplicates and validates registration alert recipients" do
      allow(ENV).to receive(:fetch).with("TOURNAMENT_NOTIFICATION_CHANNELS", "log").and_return("email")
      create(
        :setting,
        branch: branch,
        tournament_registration_admin_email: "Z.AHMED@mavoid.com",
        send_registration_alerts_to_global_recipient: true
      )

      mail_delivery = instance_double(ActionMailer::MessageDelivery, deliver_later: true)
      recipients = []
      allow(TournamentNotificationMailer).to receive(:with) do |args|
        recipients << args[:recipient]
        double(event_notification: mail_delivery)
      end

      described_class.new.perform("tournament_registration_created", tournament.id, { "registration_id" => 1 })

      expect(recipients).to eq(["z.ahmed@mavoid.com"])
    end

    it "logs and continues when email enqueue fails" do
      allow(ENV).to receive(:fetch).with("TOURNAMENT_NOTIFICATION_CHANNELS", "log").and_return("email")
      allow(Rails.logger).to receive(:error)
      allow(TournamentNotificationMailer).to receive(:with).and_raise(StandardError, "mailer down")

      expect do
        described_class.new.perform("match_scored", tournament.id, { "match_id" => 1 })
      end.not_to raise_error

      expect(Rails.logger).to have_received(:error).with(include("failed_to_enqueue_email", "match_scored"))
    end
  end
end
