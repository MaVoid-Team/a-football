module Bookings
  class Creator
    def initialize(params:, branch:)
      @params = params
      @branch = branch
    end

    def call
      return ServiceResult.failure("Branch is not active") unless @branch.active?

      court = Court.find_by(id: @params[:court_id], branch_id: @branch.id)
      return ServiceResult.failure("Court not found or does not belong to this branch") unless court
      return ServiceResult.failure("Court is not active") unless court.active?

      slots = normalize_slots(@params[:booking_slots_attributes])
      if slots.empty? && @params[:start_time].present? && @params[:end_time].present?
        slots = [{ "start_time" => @params[:start_time].to_s, "end_time" => @params[:end_time].to_s }]
      end
      return ServiceResult.failure("At least one slot must be provided") if slots.empty?

      date = parse_date(@params[:date])
      return ServiceResult.failure("Invalid date format") unless date
      return ServiceResult.failure("Cannot book in the past") if date < Date.current

      parsed_slots = []
      total_hours   = 0
      total_price   = 0
      slot_ranges   = []

      hourly_rates = court.hourly_rates.active.ordered.to_a

      slots.each do |slot|
        s_time = parse_time(slot["start_time"])
        e_time = parse_time(slot["end_time"])
        return ServiceResult.failure("Invalid slot time format") unless s_time && e_time
        return ServiceResult.failure("Slot end time must be after start time") if e_time <= s_time
        slot_ranges  << (s_time...e_time)
        parsed_slots << { start_time: s_time, end_time: e_time }
        total_hours  += ((e_time - s_time) / 1.hour).ceil
        total_price  += calculate_slot_price(s_time, e_time, court, hourly_rates)
      end

      slot_ranges.combination(2).each do |a, b|
        return ServiceResult.failure("Selected slots overlap with each other") if a.overlaps?(b)
      end

      original_price  = total_price
      discount_amount = 0
      promo_code      = nil

      if @params[:promo_code].present?
        promo_code = @branch.promo_codes.valid_now.by_code(@params[:promo_code]).first
        if promo_code&.applicable?(total_price)
          discount_amount = promo_code.calculate_discount(total_price)
          total_price     = [total_price - discount_amount, 0].max
        end
      end

      booking = nil

      ActiveRecord::Base.transaction do
        Court.lock("FOR UPDATE").find(court.id)

        parsed_slots.each do |slot|
          if Booking.overlapping(court.id, date, slot[:start_time], slot[:end_time]).exists?
            raise ActiveRecord::Rollback, "overlap"
          end
          if BlockedSlot.overlapping(court.id, date, slot[:start_time], slot[:end_time]).exists?
            raise ActiveRecord::Rollback, "blocked"
          end
        end

        booking = Booking.create!(
          branch:          @branch,
          court:           court,
          promo_code:      promo_code,
          user_name:       @params[:user_name],
          user_phone:      @params[:user_phone],
          date:            date,
          start_time:      parsed_slots.first[:start_time],
          end_time:        parsed_slots.last[:end_time],
          hours:           total_hours,
          total_price:     total_price,
          original_price:  original_price,
          discount_amount: discount_amount,
          status:          :confirmed,
          payment_status:  :pending
        )

        parsed_slots.each do |slot|
          booking.booking_slots.create!(start_time: slot[:start_time], end_time: slot[:end_time])
        end

        promo_code&.increment_usage!
      end

      return ServiceResult.failure("Time slot is not available") unless booking

      Availability::CacheInvalidator.new(
        branch_id: @branch.id,
        court_id:  court.id,
        date:      date
      ).call

      BookingConfirmationJob.perform_later(booking.id)

      ServiceResult.success(booking)
    rescue ActiveRecord::RecordInvalid => e
      ServiceResult.failure(e.record.errors.full_messages)
    end

    private

    # Normalises booking_slots_attributes regardless of whether it arrives as:
    #   - An Array of ActionController::Parameters (JSON request)
    #   - An ActionController::Parameters hash with numeric string keys {"0"=>{…}} (multipart)
    #   - A plain Ruby Hash or Array (tests / internal callers)
    def normalize_slots(raw)
      return [] if raw.blank?

      data = raw.respond_to?(:to_unsafe_h) ? raw.to_unsafe_h : raw

      case data
      when Array
        data.map { |s| to_plain_hash(s) }
      when Hash
        data.sort_by { |k, _| k.to_s.to_i }.map { |_, v| to_plain_hash(v) }
      else
        []
      end
    end

    def to_plain_hash(val)
      h = val.respond_to?(:to_unsafe_h) ? val.to_unsafe_h : val.to_h
      h.transform_keys(&:to_s)
    end

    def parse_date(date_str)
      Date.parse(date_str.to_s)
    rescue ArgumentError, TypeError
      nil
    end

    def parse_time(time_str)
      Time.zone.parse(time_str.to_s)
    rescue ArgumentError, TypeError
      nil
    end

    def calculate_slot_price(start_time, end_time, court, hourly_rates)
      total   = 0
      current = start_time
      while current < end_time
        hour  = current.hour
        rate  = hourly_rates.find { |r| r.start_hour <= hour && r.end_hour > hour }
        total += rate ? rate.price_per_hour : court.price_per_hour
        current += 1.hour
      end
      total
    end
  end
end
