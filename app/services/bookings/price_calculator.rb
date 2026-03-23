module Bookings
  class PriceCalculator
    SLOT_INTERVAL = 30.minutes

    def initialize(court:, slots:)
      @court = court
      @slots = slots
    end

    def call
      parsed_slots = parse_slots
      return ServiceResult.failure(@error, error_codes: [@error_code]) if @error

      sequence_result = validate_slot_sequence(parsed_slots)
      if sequence_result
        return ServiceResult.failure(sequence_result[:message], error_codes: [sequence_result[:code]])
      end

      total_hours = BigDecimal("0")
      total_price = BigDecimal("0")
      hourly_rates = @court.hourly_rates.active.ordered.to_a

      parsed_slots.each do |slot|
        total_hours += BigDecimal(((slot[:end_time] - slot[:start_time]) / 1.hour.to_f).to_s)
        total_price += calculate_slot_price(slot[:start_time], slot[:end_time], hourly_rates)
      end

      ServiceResult.success(
        parsed_slots: parsed_slots,
        total_hours: total_hours,
        total_price: total_price.round(2)
      )
    end

    private

    def parse_slots
      parsed = []

      @slots.each do |slot|
        start_time = parse_time(slot["start_time"])
        end_time = parse_time(slot["end_time"])

        if start_time.nil? || end_time.nil?
          @error = "Invalid slot time format"
          @error_code = "invalid_slot_time_format"
          return []
        end

        if end_time <= start_time
          @error = "Slot end time must be after start time"
          @error_code = "slot_end_before_start"
          return []
        end

        parsed << { start_time: start_time, end_time: end_time }
      end

      parsed.sort_by { |slot| slot[:start_time] }
    end

    def parse_time(time_str)
      Time.zone.parse(time_str.to_s)
    rescue ArgumentError, TypeError
      nil
    end

    def validate_slot_sequence(parsed_slots)
      if parsed_slots.length < 2
        return {
          code: "minimum_booking_duration",
          message: "Minimum booking duration is 1 hour. Please select at least two adjacent 30-minute slots"
        }
      end

      unless parsed_slots.all? { |slot| (slot[:end_time] - slot[:start_time]).to_i == SLOT_INTERVAL }
        return {
          code: "slot_duration_not_half_hour",
          message: "Each selected slot must be exactly 30 minutes"
        }
      end

      parsed_slots.each_cons(2) do |prev_slot, next_slot|
        unless prev_slot[:end_time] == next_slot[:start_time]
          return {
            code: "slots_not_adjacent",
            message: "Selected slots must be adjacent. Please remove gaps between selected times"
          }
        end
      end

      nil
    end

    def calculate_slot_price(start_time, end_time, hourly_rates)
      total = BigDecimal("0")
      current = start_time

      while current < end_time
        segment_end = [current + SLOT_INTERVAL, end_time].min
        hour = current.hour
        rate = hourly_rates.find { |r| r.start_hour <= hour && r.end_hour > hour }
        hourly_price = BigDecimal((rate ? rate.price_per_hour : @court.price_per_hour).to_s)
        hours_fraction = BigDecimal(((segment_end - current) / 1.hour.to_f).to_s)
        total += hourly_price * hours_fraction
        current = segment_end
      end

      total
    end
  end
end
