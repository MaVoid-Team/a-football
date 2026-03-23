module Api
  module Admin
    module Crm
      class SegmentsController < BaseController
        def index
          segments = scoped_segments.active_only.order(:name)
          render json: {
            data: segments.map { |segment| serialize_segment(segment) }
          }, status: :ok
        end

        def players
          segment = scoped_segments.active_only.find(params[:id])
          players = ::Crm::PlayersQuery.new(admin: current_admin, params: params.merge(segment_id: segment.id)).call

          response.set_header("X-Total-Count", players[:meta][:total_count].to_s)
          response.set_header("X-Page", players[:meta][:page].to_s)
          response.set_header("X-Per-Page", players[:meta][:per_page].to_s)
          response.set_header("X-Total-Pages", players[:meta][:total_pages].to_s)

          render json: {
            data: players[:data],
            segment: serialize_segment(segment)
          }, status: :ok
        end

        private

        def serialize_segment(segment)
          {
            id: segment.id,
            name: segment.name,
            conditions: segment.conditions,
            active: segment.active,
            branch_id: segment.branch_id
          }
        end
      end
    end
  end
end
