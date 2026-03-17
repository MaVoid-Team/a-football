module Api
  module Admin
    class ReviewsController < BaseController
      def index
        reviews = policy_scope(Review).includes(:court, :branch, :booking)
        reviews = reviews.where(court_id: params[:court_id]) if params[:court_id].present?
        reviews = reviews.where(branch_id: params[:branch_id]) if params[:branch_id].present?
        reviews = reviews.where(rating: params[:rating]) if params[:rating].present?
        reviews = reviews.order(created_at: :desc)

        result = paginate(reviews)
        render json: ReviewSerializer.new(result).serializable_hash, status: :ok
      end

      def destroy
        review = Review.find(params[:id])
        authorize review
        review.destroy!
        head :no_content
      end
    end
  end
end
