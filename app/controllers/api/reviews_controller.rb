module Api
  class ReviewsController < BaseController
    skip_before_action :verify_authenticity_token, raise: false

    def index
      unless params[:court_id].present?
        return render json: { error: "court_id is required" }, status: :bad_request
      end

      reviews = Review
        .where(court_id: params[:court_id])
        .order(created_at: :desc)

      result = paginate(reviews)
      render json: ReviewSerializer.new(result).serializable_hash, status: :ok
    end

    def create
      booking = Booking.find_by(id: review_params[:booking_id])

      unless booking
        return render json: { error: "Booking not found" }, status: :not_found
      end

      unless booking.confirmed?
        return render json: { error: "Only confirmed bookings can be reviewed" }, status: :unprocessable_entity
      end

      unless booking.user_phone.to_s.gsub(/\D/, "") == review_params[:user_phone].to_s.gsub(/\D/, "")
        return render json: { error: "Phone number does not match the booking" }, status: :unprocessable_entity
      end

      if Review.exists?(booking_id: booking.id)
        return render json: { error: "This booking has already been reviewed" }, status: :unprocessable_entity
      end

      review = Review.new(
        booking:       booking,
        court:         booking.court,
        branch:        booking.branch,
        reviewer_name: booking.user_name,
        rating:        review_params[:rating],
        body:          review_params[:body]
      )

      if review.save
        render json: ReviewSerializer.new(review).serializable_hash, status: :created
      else
        render json: { errors: review.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def review_params
      params.require(:review).permit(:booking_id, :user_phone, :rating, :body)
    end
  end
end
