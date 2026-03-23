module Api
  class PromoCodesController < BaseController
    def validate
      branch = Branch.find(params[:branch_id])
      code = params[:code].to_s
      total_amount = resolve_total_amount(branch)
      return if performed?

      @promo_code = branch.promo_codes.valid_now.by_code(code).first

      if @promo_code&.applicable?(total_amount)
        discount = @promo_code.calculate_discount(total_amount)
        render json: {
          valid: true,
          promo_code: serialized_promo_code(@promo_code),
          validated_total_amount: total_amount,
          discount_amount: discount,
          final_amount: total_amount - discount
        }
      else
        render json: {
          valid: false,
          error: @promo_code ? "Promo code is not applicable" : "Invalid promo code"
        }
      end
    end

    private

    def resolve_total_amount(branch)
      return params[:total_amount].to_f unless pricing_params_present?

      court = branch.courts.active.find_by(id: params[:court_id])
      unless court
        render json: { valid: false, error: "Invalid court" }, status: :unprocessable_entity
        return nil
      end

      pricing = Bookings::PriceCalculator.new(court: court, slots: booking_slots).call
      if pricing.failure?
        render json: { valid: false, error: pricing.errors.first }, status: :unprocessable_entity
        return nil
      end

      pricing.data[:total_price].to_f
    end

    def pricing_params_present?
      params[:court_id].present? && params[:booking_slots_attributes].present?
    end

    def booking_slots
      Array(params[:booking_slots_attributes]).map do |slot|
        slot.respond_to?(:to_unsafe_h) ? slot.to_unsafe_h : slot.to_h
      end
    end

    def serialized_promo_code(promo_code)
      {
        id: promo_code.id.to_s,
        code: promo_code.code,
        description: promo_code.description,
        discount_percentage: promo_code.discount_percentage,
        discount_amount: promo_code.discount_amount,
        minimum_amount: promo_code.minimum_amount,
        usage_limit: promo_code.usage_limit,
        used_count: promo_code.used_count,
        starts_at: promo_code.starts_at,
        expires_at: promo_code.expires_at,
        active: promo_code.active,
        branch_id: promo_code.branch_id.to_s,
        created_at: promo_code.created_at,
        updated_at: promo_code.updated_at
      }
    end
  end
end
