module Api
  class PromoCodesController < BaseController
    def validate
      branch = Branch.find(params[:branch_id])
      code = params[:code]
      total_amount = params[:total_amount].to_f
      
      @promo_code = branch.promo_codes.valid_now.by_code(code).first
      
      if @promo_code&.applicable?(total_amount)
        discount = @promo_code.calculate_discount(total_amount)
        render json: {
          valid: true,
          promo_code: PromoCodeSerializer.new(@promo_code).serializable_hash,
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
  end
end
