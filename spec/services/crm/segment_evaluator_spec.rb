require "rails_helper"

RSpec.describe Crm::SegmentEvaluator do
  describe "#match?" do
    let(:player) { build(:user, total_bookings: 5, total_matches: 1, total_tournaments: 0, last_activity_date: 2.days.ago, tags: ["vip"]) }

    it "matches numeric gte rules" do
      segment = Segment.new(
        conditions: {
          "operator" => "all",
          "rules" => [
            { "field" => "total_bookings", "op" => "gte", "value" => 3 }
          ]
        }
      )

      expect(described_class.new(segment: segment, player: player).match?).to be(true)
    end

    it "matches tag includes rules" do
      segment = Segment.new(
        conditions: {
          "operator" => "all",
          "rules" => [
            { "field" => "tags", "op" => "includes", "value" => "vip" }
          ]
        }
      )

      expect(described_class.new(segment: segment, player: player).match?).to be(true)
    end

    it "returns false when rules are not met" do
      segment = Segment.new(
        conditions: {
          "operator" => "all",
          "rules" => [
            { "field" => "total_tournaments", "op" => "gte", "value" => 1 }
          ]
        }
      )

      expect(described_class.new(segment: segment, player: player).match?).to be(false)
    end
  end
end
