require "rails_helper"

RSpec.describe Booking, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:branch) }
    it { is_expected.to belong_to(:court) }
    it { is_expected.to have_many(:payments).dependent(:destroy) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:user_name) }
    it { is_expected.to validate_presence_of(:user_phone) }
    it { is_expected.to validate_presence_of(:date) }
    it { is_expected.to validate_presence_of(:start_time) }
    it { is_expected.to validate_presence_of(:end_time) }
    it { is_expected.to validate_presence_of(:hours) }
    it { is_expected.to validate_numericality_of(:hours).is_greater_than(0) }
    it { is_expected.to validate_presence_of(:total_price) }
  end

  describe "enums" do
    it { is_expected.to define_enum_for(:status).with_values(confirmed: 0, cancelled: 1) }
    it { is_expected.to define_enum_for(:payment_status).with_values(pending: 0, paid: 1, failed: 2) }
  end

  describe ".overlapping" do
    let(:court) { create(:court) }
    let!(:booking) do
      create(:booking, court: court, date: Date.tomorrow,
             start_time: "10:00", end_time: "12:00")
    end

    it "finds overlapping bookings" do
      st = Time.zone.parse("2000-01-01 11:00")
      et = Time.zone.parse("2000-01-01 13:00")
      result = Booking.overlapping(court.id, Date.tomorrow, st, et)
      expect(result).to include(booking)
    end

    it "does not return non-overlapping bookings" do
      st = Time.zone.parse("2000-01-01 13:00")
      et = Time.zone.parse("2000-01-01 14:00")
      result = Booking.overlapping(court.id, Date.tomorrow, st, et)
      expect(result).to be_empty
    end
  end

  describe "unique index on court_id, date, start_time" do
    it "prevents duplicate bookings" do
      court = create(:court)
      create(:booking, court: court, date: Date.tomorrow, start_time: "10:00", end_time: "11:00")

      duplicate = build(:booking, court: court, date: Date.tomorrow, start_time: "10:00", end_time: "11:00")
      expect { duplicate.save!(validate: false) }.to raise_error(ActiveRecord::RecordNotUnique)
    end
  end
end
