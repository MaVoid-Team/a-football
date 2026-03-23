module Api
  class EventsController < BaseController
    skip_before_action :authenticate_user!, only: %i[index show]

    def index
      events = Event.includes(branch: :setting)

      events = events.for_branch(params[:branch_id]) if params[:branch_id].present?
      events = events.upcoming if params[:upcoming].present?
      events = events.in_date_range(params[:from_date], params[:to_date])
      events = apply_sort(events, { "start_date" => :start_date, "title" => :title }, { start_date: :asc })

      result = search_with_pagination(Event, events, build_event_filter)
      render json: EventSerializer.new(result).serializable_hash, status: :ok
    end

    def show
      event = Event.includes(branch: :setting).find(params[:id])
      render json: EventSerializer.new(event).serializable_hash, status: :ok
    end

    private

    def build_event_filter
      parts = []
      parts << "branch_id = #{params[:branch_id].to_i}" if params[:branch_id].present?
      parts << "start_date >= #{params[:from_date]}" if params[:from_date].present?
      parts << "start_date <= #{params[:to_date]}" if params[:to_date].present?
      build_meilisearch_filter(parts)
    end
  end
end
