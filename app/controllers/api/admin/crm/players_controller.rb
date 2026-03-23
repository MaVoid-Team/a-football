module Api
  module Admin
    module Crm
      class PlayersController < BaseController
        def index
          result = ::Crm::PlayersQuery.new(admin: current_admin, params: params).call

          response.set_header("X-Total-Count", result[:meta][:total_count].to_s)
          response.set_header("X-Page", result[:meta][:page].to_s)
          response.set_header("X-Per-Page", result[:meta][:per_page].to_s)
          response.set_header("X-Total-Pages", result[:meta][:total_pages].to_s)

          render json: { data: result[:data] }, status: :ok
        end

        def show
          player_type, player = find_player!(params[:id])

          activities = scoped_activity_logs
                       .where(player_type: player_type, player_id: player.id)
                       .recent_first
                       .limit(100)
                       .map do |activity|
            {
              id: activity.id,
              activity_type: activity.activity_type,
              reference_type: activity.reference_type,
              reference_id: activity.reference_id,
              metadata: activity.metadata,
              created_at: activity.created_at
            }
          end

          render json: {
            data: {
              key: "#{player_type}-#{player.id}",
              player_type: player_type,
              player_id: player.id,
              name: player.name,
              phone: player.phone,
              email: player.email,
              skill_level: player.skill_level,
              last_activity_date: player.last_activity_date,
              total_bookings: player.total_bookings.to_i,
              total_matches: player.total_matches.to_i,
              total_tournaments: player.total_tournaments.to_i,
              tags: player.tags || [],
              activities: activities
            }
          }, status: :ok
        end

        def update_tags
          _player_type, player = find_player!(params[:id])
          action = params[:action_type].to_s
          tag = params[:tag].to_s

          case action
          when "add"
            player.add_tag!(tag)
          when "remove"
            player.remove_tag!(tag)
          else
            render json: { errors: ["Invalid action_type. Use add or remove"] }, status: :unprocessable_entity
            return
          end

          render json: { data: { key: params[:id], tags: player.reload.tags } }, status: :ok
        end
      end
    end
  end
end
