module Api
  module Admin
    class BookingsController < BaseController
      def index
        bookings = policy_scope(Booking).includes(:court, :branch)
        bookings = bookings.where(branch_id: params[:branch_id]) if params[:branch_id].present?
        bookings = bookings.where(court_id: params[:court_id]) if params[:court_id].present?
        bookings = bookings.where(date: params[:date]) if params[:date].present?
        bookings = bookings.where(status: params[:status]) if params[:status].present?
        bookings = bookings.where(payment_status: params[:payment_status]) if params[:payment_status].present?
        bookings = bookings.in_date_range(params[:from_date], params[:to_date])
        bookings = apply_sort(bookings, { "date" => :date, "created_at" => :created_at }, { created_at: :desc })

        result = search_with_pagination(Booking, bookings, build_booking_filter)
        render json: BookingSerializer.new(result, params: { url_options: default_url_options }).serializable_hash, status: :ok
      end

      def show
        booking = Booking.find(params[:id])
        authorize booking
        render json: BookingSerializer.new(booking, params: { url_options: default_url_options }).serializable_hash, status: :ok
      end

      def update
        booking = Booking.find(params[:id])
        authorize booking

        if params[:cancel].present?
          result = Bookings::Canceller.new(booking: booking).call
          if result.success?
            render json: BookingSerializer.new(result.data, params: { url_options: default_url_options }).serializable_hash, status: :ok
          else
            render json: { errors: result.errors }, status: :unprocessable_entity
          end
        else
          booking.update!(booking_update_params)
          render json: BookingSerializer.new(booking, params: { url_options: default_url_options }).serializable_hash, status: :ok
        end
      end

      def mark_no_show
        booking = Booking.find(params[:id])
        authorize booking, :update?

        ::Crm::ActivityLogger.new(
          player: booking.user,
          activity_type: "no_show",
          reference: booking,
          branch_id: booking.branch_id,
          actor_admin: current_admin,
          add_tags: ["no_show"],
          metadata: {
            booking_id: booking.id,
            user_name: booking.user_name,
            user_phone: booking.user_phone,
            date: booking.date,
            reason: params[:reason]
          }
        ).call

        render json: BookingSerializer.new(booking, params: { url_options: default_url_options }).serializable_hash, status: :ok
      end

      def destroy
        booking = Booking.find(params[:id])
        authorize booking

        booking.destroy!
        head :no_content
      end

      def batch_destroy
        booking_ids = params[:booking_ids] || []
        
        bookings = Booking.where(id: booking_ids)
        bookings.each do |booking|
          authorize booking
        end

        destroyed_count = 0
        bookings.each do |booking|
          booking.destroy!
          destroyed_count += 1
        end

        render json: { 
          message: "Successfully deleted #{destroyed_count} booking(s)",
          deleted_count: destroyed_count
        }, status: :ok
      end

      private

      def booking_update_params
        params.require(:booking).permit(:payment_status, :admin_notes)
      end

      def build_booking_filter
        parts = []
        parts << "branch_id = #{params[:branch_id].to_i}" if params[:branch_id].present?
        parts << "court_id = #{params[:court_id].to_i}" if params[:court_id].present?
        if params[:status].present?
          status_value = Booking.statuses[params[:status].to_s]
          parts << "status = #{status_value}" unless status_value.nil?
        end
        if params[:payment_status].present?
          payment_status_value = Booking.payment_statuses[params[:payment_status].to_s]
          parts << "payment_status = #{payment_status_value}" unless payment_status_value.nil?
        end
        parts << "date >= #{params[:from_date].to_s.inspect}" if params[:from_date].present?
        parts << "date <= #{params[:to_date].to_s.inspect}" if params[:to_date].present?
        build_meilisearch_filter(parts)
      end

      def default_url_options
        {
          host: request.host,
          port: request.port,
          protocol: request.protocol.chomp("://")
        }
      end
    end
  end
end
