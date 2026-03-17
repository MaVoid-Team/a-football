module Api
  module Admin
    class PromoCodesController < BaseController
      before_action :set_branch
      before_action :set_promo_code, only: [:show, :update, :destroy]

      def index
        @promo_codes = policy_scope(@branch.promo_codes).order(created_at: :desc)
        render json: PromoCodeSerializer.new(@promo_codes).serializable_hash
      end

      def show
        authorize @promo_code
        render json: PromoCodeSerializer.new(@promo_code).serializable_hash
      end

      def create
        @promo_code = @branch.promo_codes.build(promo_code_params)
        authorize @promo_code
        
        if @promo_code.save
          render json: PromoCodeSerializer.new(@promo_code).serializable_hash, status: :created
        else
          render json: { errors: @promo_code.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        authorize @promo_code
        if @promo_code.update(promo_code_params)
          render json: PromoCodeSerializer.new(@promo_code).serializable_hash
        else
          render json: { errors: @promo_code.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        authorize @promo_code
        @promo_code.destroy
        head :no_content
      end

      def validate
        authorize @branch, :show?
        code = params[:code]
        total_amount = params[:total_amount].to_f
        
        @promo_code = @branch.promo_codes.valid_now.by_code(code).first
        
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

      private

      def set_branch
        @branch = Branch.find(params[:branch_id])
      end

      def set_promo_code
        @promo_code = @branch.promo_codes.find(params[:id])
      end

      def promo_code_params
        params.require(:promo_code).permit(
          :code,
          :description,
          :discount_percentage,
          :discount_amount,
          :minimum_amount,
          :usage_limit,
          :starts_at,
          :expires_at,
          :active
        )
      end
    end
  end
end
