module Bookings
  class Creator
    SLOT_INTERVAL = 30.minutes

    def initialize(params:, branch:, user: nil)
      @params = params
      @branch = branch
      @user = user
    end

    def call
      return failure_with("branch_inactive", "Branch is not active") unless @branch.active?

      court = Court.find_by(id: @params[:court_id], branch_id: @branch.id)
      return failure_with("court_not_found", "Court not found or does not belong to this branch") unless court
      return failure_with("court_inactive", "Court is not active") unless court.active?

      slots = normalize_slots(@params[:booking_slots_attributes])
      if slots.empty? && @params[:start_time].present? && @params[:end_time].present?
        slots = expand_range_to_half_hour_slots(@params[:start_time], @params[:end_time])
        return failure_with("booking_range_invalid_interval", "Booking range must be in 30-minute intervals") if slots.empty?
      end
      return failure_with("booking_slots_required", "At least one slot must be provided") if slots.empty?

      date = parse_date(@params[:date])
      return failure_with("invalid_date_format", "Invalid date format") unless date
      return failure_with("booking_in_past", "Cannot book in the past") if date < Date.current

      pricing_result = Bookings::PriceCalculator.new(court: court, slots: slots).call
      return ServiceResult.failure(pricing_result.errors, error_codes: pricing_result.error_codes) if pricing_result.failure?

      parsed_slots = pricing_result.data[:parsed_slots]
      total_hours = pricing_result.data[:total_hours]
      original_price = pricing_result.data[:total_price]

      promo_code_input = @params[:promo_code].to_s.strip
      total_price = original_price
      discount_amount = BigDecimal("0")
      promo_code = nil
      setting = Setting.find_by(branch_id: @branch.id)
      pay_deposit = ActiveModel::Type::Boolean.new.cast(@params[:pay_deposit])
      payment_option = :full
      deposit_percentage_snapshot = BigDecimal("0")
      amount_due_now = total_price
      amount_remaining = BigDecimal("0")

      booking = nil
      failure_message = nil
      failure_code = nil

      ActiveRecord::Base.transaction do
        Court.lock("FOR UPDATE").find(court.id)

        if promo_code_input.present?
          promo_code = @branch.promo_codes.lock("FOR UPDATE").valid_now.by_code(promo_code_input).first
          unless promo_code
            failure_message = "Invalid promo code"
            failure_code = "promo_code_invalid"
            raise ActiveRecord::Rollback
          end

          unless promo_code.applicable?(original_price)
            failure_message = "Promo code is not applicable"
            failure_code = "promo_code_not_applicable"
            raise ActiveRecord::Rollback
          end

          discount_amount = promo_code.calculate_discount(original_price)
          total_price = [original_price - discount_amount, 0].max
        end

        if pay_deposit
          unless setting&.deposit_enabled?
            failure_message = "Deposit payment is not available for this branch"
            failure_code = "deposit_unavailable_for_branch"
            raise ActiveRecord::Rollback
          end

          payment_option = :deposit
          deposit_percentage_snapshot = setting.deposit_percentage.to_d
          amount_due_now = (total_price * deposit_percentage_snapshot / 100).round(2)
          amount_remaining = (total_price - amount_due_now).round(2)
        else
          payment_option = :full
          deposit_percentage_snapshot = BigDecimal("0")
          amount_due_now = total_price
          amount_remaining = BigDecimal("0")
        end

        parsed_slots.each do |slot|
          if Booking.overlapping(court.id, date, slot[:start_time], slot[:end_time]).exists?
            failure_message = "Time slot is not available"
            failure_code = "slot_unavailable"
            raise ActiveRecord::Rollback
          end
          if BlockedSlot.overlapping(court.id, date, slot[:start_time], slot[:end_time]).exists?
            failure_message = "Time slot is not available"
            failure_code = "slot_unavailable"
            raise ActiveRecord::Rollback
          end
        end

        booking = Booking.create!(
          branch:          @branch,
          court:           court,
          user:            @user,
          promo_code:      promo_code,
          user_name:       @params[:user_name].presence || @user&.name,
          user_phone:      @params[:user_phone].presence || @user&.phone,
          date:            date,
          start_time:      parsed_slots.first[:start_time],
          end_time:        parsed_slots.last[:end_time],
          hours:           total_hours,
          total_price:     total_price,
          original_price:  original_price,
          discount_amount: discount_amount,
          payment_option:  payment_option,
          deposit_percentage_snapshot: deposit_percentage_snapshot,
          amount_due_now: amount_due_now,
          amount_remaining: amount_remaining,
          status:          :confirmed,
          payment_status:  :pending
        )

        parsed_slots.each do |slot|
          booking.booking_slots.create!(start_time: slot[:start_time], end_time: slot[:end_time])
        end

        promo_code&.increment_usage!
      end

      return ServiceResult.failure(failure_message, error_codes: [failure_code].compact) if failure_message
      return failure_with("slot_unavailable", "Time slot is not available") unless booking

      Availability::CacheInvalidator.new(
        branch_id: @branch.id,
        court_id:  court.id,
        date:      date
      ).call

      BookingConfirmationJob.perform_later(booking.id)

      Crm::ActivityLogger.new(
        player: booking.user,
        activity_type: "booking",
        reference: booking,
        branch_id: booking.branch_id,
        metadata: {
          booking_id: booking.id,
          user_name: booking.user_name,
          user_phone: booking.user_phone,
          court_id: booking.court_id,
          date: booking.date
        }
      ).call

      ServiceResult.success(booking)
    rescue ActiveRecord::RecordInvalid => e
      ServiceResult.failure(e.record.errors.full_messages, error_codes: ["booking_validation_failed"])
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

    def expand_range_to_half_hour_slots(start_time, end_time)
      start_at = parse_time(start_time)
      end_at = parse_time(end_time)
      return [] unless start_at && end_at && end_at > start_at

      slots = []
      current = start_at

      while current < end_at
        segment_end = current + SLOT_INTERVAL
        return [] if segment_end > end_at

        slots << {
          "start_time" => current.strftime("%H:%M"),
          "end_time" => segment_end.strftime("%H:%M")
        }
        current = segment_end
      end

      slots
    end

    def failure_with(code, message)
      ServiceResult.failure(message, error_codes: [code])
    end

  end
end
