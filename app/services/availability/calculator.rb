module Availability
  class Calculator
    DEFAULT_OPENING_HOUR = 8
    DEFAULT_CLOSING_HOUR = 23
    SLOT_INTERVAL = 30.minutes
    CACHE_TTL = 5.minutes.to_i

    def initialize(branch_id:, court_id:, date:)
      @branch_id = branch_id
      @court_id = court_id
      @date = date.to_s
    end

    def call
      cached = REDIS.get(cache_key)
      return JSON.parse(cached) if cached

      slots = compute_available_slots
      REDIS.setex(cache_key, CACHE_TTL, slots.to_json)
      slots
    end

    private

    def cache_key
      "availability:#{@branch_id}:#{@court_id}:#{@date}"
    end

    def compute_available_slots
      all_slots = generate_time_slots
      booked = booked_slots
      blocked = blocked_slots

      all_slots.reject do |slot|
        booked.any? { |b| overlaps?(slot, b) } ||
          blocked.any? { |b| overlaps?(slot, b) }
      end
    end

    def generate_time_slots
      opening, closing = operating_hours

      current = Time.zone.parse(format("2000-01-01 %02d:00", opening))
      closing_time = Time.zone.parse(format("2000-01-01 %02d:00", closing))

      slots = []

      while current < closing_time
        slot_end = [current + SLOT_INTERVAL, closing_time].min
        slots << {
          "start_time" => current.strftime("%H:%M"),
          "end_time" => slot_end.strftime("%H:%M")
        }
        current = slot_end
      end

      slots
    end

    def operating_hours
      setting = Setting.find_by(branch_id: @branch_id)
      opening = setting&.opening_hour || DEFAULT_OPENING_HOUR
      closing = setting&.closing_hour || DEFAULT_CLOSING_HOUR
      [opening, closing]
    end

    def booked_slots
      Booking.where(court_id: @court_id, date: @date, status: :confirmed)
             .pluck(:start_time, :end_time)
             .map do |st, et|
        {
          start: st.strftime("%H:%M"),
          end: et.strftime("%H:%M")
        }
      end
    end

    def blocked_slots
      BlockedSlot.where(court_id: @court_id, date: @date)
                 .pluck(:start_time, :end_time)
                 .map do |st, et|
        {
          start: st.strftime("%H:%M"),
          end: et.strftime("%H:%M")
        }
      end
    end

    def overlaps?(slot, range)
      slot_start = slot["start_time"]
      slot_end = slot["end_time"]
      slot_start < range[:end] && slot_end > range[:start]
    end
  end
end
