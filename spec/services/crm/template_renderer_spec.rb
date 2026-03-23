require "rails_helper"

RSpec.describe Crm::TemplateRenderer do
  describe "#call" do
    it "replaces supported variables" do
      rendered = described_class.new(
        content: "Hi {name}, welcome to {club_name}",
        variables: { name: "Ziad", club_name: "A Football" }
      ).call

      expect(rendered).to eq("Hi Ziad, welcome to A Football")
    end

    it "keeps unsupported placeholders untouched" do
      rendered = described_class.new(
        content: "Hello {name} {unknown}",
        variables: { name: "Player" }
      ).call

      expect(rendered).to eq("Hello Player {unknown}")
    end
  end
end
