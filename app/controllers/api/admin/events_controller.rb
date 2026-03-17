module Api
  module Admin
    class EventsController < BaseController
      def index
        events = policy_scope(Event).includes(:event_bookings)
        events = events.where(branch_id: params[:branch_id]) if params[:branch_id].present?
        events = events.in_date_range(params[:from_date], params[:to_date])
        events = apply_sort(events, { "start_date" => :start_date, "title" => :title }, { start_date: :asc })

        result = search_with_pagination(Event, events, build_event_filter)
        render json: EventSerializer.new(result).serializable_hash, status: :ok
      end

      def show
        event = Event.find(params[:id])
        authorize event
        render json: EventSerializer.new(event).serializable_hash, status: :ok
      end

      def create
        event = Event.new(event_params)
        authorize event
        event.save!
        render json: EventSerializer.new(event).serializable_hash, status: :created
      end

      def update
        event = Event.find(params[:id])
        authorize event
        event.update!(event_params)
        render json: EventSerializer.new(event).serializable_hash, status: :ok
      end

      def destroy
        event = Event.find(params[:id])
        authorize event
        event.destroy!
        head :no_content
      end

      private

      def event_params
        params.require(:event).permit(
          :branch_id, :title, :description,
          :start_date, :participation_price, :max_participants
        )
      end

      def build_event_filter
        parts = []
        parts << "branch_id = #{params[:branch_id].to_i}" if params[:branch_id].present?
        parts << "start_date >= #{params[:from_date]}" if params[:from_date].present?
        parts << "start_date <= #{params[:to_date]}" if params[:to_date].present?
        build_meilisearch_filter(parts)
      end
    end
  end
end
