require "rails_helper"

RSpec.describe Availability::Calculator do
  let(:branch) { create(:branch) }
  let(:court) { create(:court, branch: branch) }
  let(:date) { Date.tomorrow }

  subject { described_class.new(branch_id: branch.id, court_id: court.id, date: date) }

  describe "#call" do
    it "returns all hourly slots when no bookings or blocks" do
      slots = subject.call
      expect(slots.length).to eq(15) # 8:00-23:00
      expect(slots.first["start_time"]).to eq("08:00")
      expect(slots.last["end_time"]).to eq("23:00")
    end

    it "removes booked slots" do
      create(:booking, court: court, date: date,
             start_time: "10:00", end_time: "11:00", status: :confirmed)

      slots = subject.call
      start_times = slots.map { |s| s["start_time"] }
      expect(start_times).not_to include("10:00")
      expect(slots.length).to eq(14)
    end

    it "removes blocked slots" do
      create(:blocked_slot, court: court, date: date,
             start_time: "14:00", end_time: "15:00")

      slots = subject.call
      start_times = slots.map { |s| s["start_time"] }
      expect(start_times).not_to include("14:00")
    end

    it "caches results in Redis" do
      subject.call
      cache_key = "availability:#{branch.id}:#{court.id}:#{date}"
      expect(REDIS.get(cache_key)).not_to be_nil
    end

    it "returns cached results on second call" do
      subject.call

      create(:booking, court: court, date: date,
             start_time: "09:00", end_time: "10:00", status: :confirmed)

      cached_slots = subject.call
      expect(cached_slots.length).to eq(15) # still cached
    end
  end
end
