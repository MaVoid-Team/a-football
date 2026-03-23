require "rails_helper"

RSpec.describe Crm::WhatsappLinkBuilder do
  describe "#call" do
    it "builds encoded WhatsApp redirect URL" do
      link = described_class.new(phone: "+20 100 123 4567", message: "Hi Player").call

      expect(link).to eq("https://wa.me/201001234567?text=Hi+Player")
    end

    it "returns nil when message is empty" do
      link = described_class.new(phone: "+201001234567", message: "").call
      expect(link).to be_nil
    end
  end
end
