module Api
  module Admin
    module Crm
      class SegmentsController < BaseController
        def index
          segments = scoped_segments.order(:name)
          render json: {
            data: segments.map { |segment| serialize_segment(segment) }
          }, status: :ok
        end

        def create
          segment = scoped_segments.new(segment_params)

          if segment.save
            sync_memberships_for(segment)
            render json: { data: serialize_segment(segment) }, status: :created
          else
            render json: { errors: segment.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          segment = scoped_segments.find(params[:id])

          if segment.update(segment_params)
            sync_memberships_for(segment)
            render json: { data: serialize_segment(segment) }, status: :ok
          else
            render json: { errors: segment.errors.full_messages }, status: :unprocessable_entity
          end
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

        def segment_params
          permitted = params.require(:segment).permit(:name, :active, :auto_update, :branch_id)
          permitted[:conditions] = params.dig(:segment, :conditions) if params.dig(:segment, :conditions).present?
          return permitted if current_admin.super_admin?

          permitted.merge(branch_id: current_admin.branch_id)
        end

        def sync_memberships_for(segment)
          return unless segment.active? && segment.auto_update?

          entries = Crm::PlayerScope.new(admin: current_admin).all_entries
          entries.each do |entry|
            Crm::SegmentMembershipSync.new(
              player: entry.record,
              branch_id: segment.branch_id || current_admin.branch_id
            ).call
          end
        end

        def serialize_segment(segment)
          {
            id: segment.id,
            name: segment.name,
            conditions: segment.conditions,
            active: segment.active,
            auto_update: segment.auto_update,
            branch_id: segment.branch_id
          }
        end
      end
    end
  end
end
