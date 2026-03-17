require "rails_helper"

RSpec.describe Event, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:branch) }
    it { is_expected.to have_many(:event_bookings).dependent(:destroy) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_presence_of(:start_date) }
    it { is_expected.to validate_presence_of(:participation_price) }
    it { is_expected.to validate_presence_of(:max_participants) }
    it { is_expected.to validate_numericality_of(:max_participants).is_greater_than(0) }
  end

  describe "#remaining_spots" do
    it "computes dynamically from confirmed bookings" do
      event = create(:event, max_participants: 10)
      create_list(:event_booking, 3, event: event, status: :confirmed)
      create(:event_booking, event: event, status: :cancelled)

      expect(event.remaining_spots).to eq(7)
    end
  end

  describe "#whatsapp_redirect_link" do
    it "generates link from branch setting" do
      branch = create(:branch)
      create(:setting, branch: branch, whatsapp_number: "201234567890")
      event = create(:event, branch: branch, title: "Test Event")

      expect(event.whatsapp_redirect_link).to include("wa.me/201234567890")
      expect(event.whatsapp_redirect_link).to include("Test")
      expect(event.whatsapp_redirect_link).to include("Event")
    end

    it "returns nil without setting" do
      event = create(:event)
      expect(event.whatsapp_redirect_link).to be_nil
    end
  end
end
