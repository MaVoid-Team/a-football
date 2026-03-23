require "rails_helper"

RSpec.describe Bookings::Creator do
  let(:branch) { create(:branch, active: true) }
  let(:court) { create(:court, branch: branch, price_per_hour: 100.00) }

  let(:valid_params) do
    {
      court_id: court.id,
      user_name: "Test User",
      user_phone: "+201001234567",
      date: Date.tomorrow.to_s,
      start_time: "10:00",
      end_time: "12:00"
    }
  end

  subject { described_class.new(params: valid_params, branch: branch) }

  describe "#call" do
    it "creates a booking successfully" do
      result = subject.call

      expect(result).to be_success
      expect(result.data).to be_a(Booking)
      expect(result.data.status).to eq("confirmed")
      expect(result.data.hours.to_f).to eq(2.0)
      expect(result.data.total_price).to eq(200.00)
    end

    it "rejects a single 30-minute slot" do
      params = valid_params.merge(
        booking_slots_attributes: [
          { start_time: "10:00", end_time: "10:30" }
        ]
      )

      result = described_class.new(params: params, branch: branch).call

      expect(result).to be_failure
      expect(result.errors).to include("Minimum booking duration is 1 hour. Please select at least two adjacent 30-minute slots")
    end

    it "rejects non-adjacent slot selections" do
      params = valid_params.merge(
        booking_slots_attributes: [
          { start_time: "10:00", end_time: "10:30" },
          { start_time: "14:00", end_time: "14:30" }
        ]
      )

      result = described_class.new(params: params, branch: branch).call

      expect(result).to be_failure
      expect(result.errors).to include("Selected slots must be adjacent. Please remove gaps between selected times")
    end

    it "allows extending booking by another adjacent half-hour" do
      params = valid_params.merge(
        booking_slots_attributes: [
          { start_time: "10:00", end_time: "10:30" },
          { start_time: "10:30", end_time: "11:00" },
          { start_time: "11:00", end_time: "11:30" }
        ]
      )

      result = described_class.new(params: params, branch: branch).call

      expect(result).to be_success
      expect(result.data.hours.to_f).to eq(1.5)
      expect(result.data.total_price).to eq(150.00)
    end

    it "returns failure for inactive branch" do
      branch.update!(active: false)
      result = subject.call
      expect(result).to be_failure
      expect(result.errors).to include("Branch is not active")
    end

    it "returns failure for inactive court" do
      court.update!(active: false)
      result = subject.call
      expect(result).to be_failure
      expect(result.errors).to include("Court is not active")
    end

    it "returns failure for past date" do
      params = valid_params.merge(date: Date.yesterday.to_s)
      result = described_class.new(params: params, branch: branch).call
      expect(result).to be_failure
      expect(result.errors).to include("Cannot book in the past")
    end

    it "prevents overlapping bookings" do
      create(:booking, court: court, date: Date.tomorrow,
             start_time: "10:00", end_time: "12:00", status: :confirmed)

      result = subject.call
      expect(result).to be_failure
      expect(result.errors).to include("Time slot is not available")
    end

    it "prevents booking on blocked slots" do
      create(:blocked_slot, court: court, date: Date.tomorrow,
             start_time: "10:00", end_time: "11:00")

      result = subject.call
      expect(result).to be_failure
      expect(result.errors).to include("Time slot is not available")
    end

    it "invalidates Redis cache" do
      cache_key = "availability:#{branch.id}:#{court.id}:#{Date.tomorrow}"
      REDIS.set(cache_key, "cached_data")

      subject.call

      expect(REDIS.get(cache_key)).to be_nil
    end

    context "race condition prevention" do
      it "handles concurrent booking attempts safely" do
        results = []
        threads = 2.times.map do
          Thread.new do
            result = described_class.new(params: valid_params, branch: branch).call
            results << result
          end
        end

        threads.each(&:join)

        successes = results.select(&:success?)
        expect(successes.length).to eq(1)
        expect(Booking.where(court: court, date: Date.tomorrow, status: :confirmed).count).to eq(1)
      end
    end

    context "with hourly pricing ranges" do
      it "uses range price when booking hour falls inside configured range" do
        create(:court_hourly_rate, court: court, start_hour: 10, end_hour: 12, price_per_hour: 150.00)

        result = subject.call

        expect(result).to be_success
        expect(result.data.total_price).to eq(300.00)
      end

      it "prorates range price for 30-minute bookings" do
        create(:court_hourly_rate, court: court, start_hour: 10, end_hour: 12, price_per_hour: 150.00)

        params = valid_params.merge(
          booking_slots_attributes: [
            { start_time: "10:30", end_time: "11:00" },
            { start_time: "11:00", end_time: "11:30" }
          ]
        )
        result = described_class.new(params: params, branch: branch).call

        expect(result).to be_success
        expect(result.data.total_price).to eq(150.00)
      end

      it "falls back to base court price for uncovered hours" do
        create(:court_hourly_rate, court: court, start_hour: 10, end_hour: 11, price_per_hour: 150.00)

        result = subject.call

        expect(result).to be_success
        # 10:00-11:00 custom(150) + 11:00-12:00 base(100)
        expect(result.data.total_price).to eq(250.00)
      end
    end

    context "with promo codes" do
      let!(:promo_code) { create(:promo_code, branch: branch, code: "SAVE10", discount_percentage: 10) }

      it "applies a valid promo code" do
        params = valid_params.merge(promo_code: "SAVE10")

        result = described_class.new(params: params, branch: branch).call

        expect(result).to be_success
        expect(result.data.original_price.to_f).to eq(200.0)
        expect(result.data.discount_amount.to_f).to eq(20.0)
        expect(result.data.total_price.to_f).to eq(180.0)
        expect(result.data.promo_code).to eq(promo_code)
      end

      it "fails when promo code does not exist" do
        params = valid_params.merge(promo_code: "MISSING")

        result = described_class.new(params: params, branch: branch).call

        expect(result).to be_failure
        expect(result.errors).to include("Invalid promo code")
      end

      it "fails when promo code is not applicable" do
        promo_code.update!(minimum_amount: 500.0)
        params = valid_params.merge(promo_code: "SAVE10")

        result = described_class.new(params: params, branch: branch).call

        expect(result).to be_failure
        expect(result.errors).to include("Promo code is not applicable")
      end
    end
  end
end
