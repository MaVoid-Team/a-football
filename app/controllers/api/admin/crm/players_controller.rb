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
          score = PlayerScore.find_by(player_type: player_type, player_id: player.id)
          flags = BehaviorFlag.for_player(player_type, player.id).active_only.pluck(:flag_type)

          activity_scope = scoped_activity_logs.where(player_type: player_type, player_id: player.id)
          if params[:activity_type].present?
            activity_scope = activity_scope.where(activity_type: params[:activity_type].to_s)
          end

          activity_page = params[:activity_page].to_i
          activity_per_page = params[:activity_per_page].to_i
          activity_page = 1 if activity_page <= 0
          activity_per_page = 20 if activity_per_page <= 0
          activity_per_page = 100 if activity_per_page > 100

          total_activities = activity_scope.count
          total_activity_pages = (total_activities.to_f / activity_per_page).ceil

          activities = activity_scope
                       .recent_first
                       .offset((activity_page - 1) * activity_per_page)
                       .limit(activity_per_page)
                       .map do |activity|
            {
              id: activity.id,
              activity_type: activity.activity_type,
              reference_type: activity.reference_type,
              reference_id: activity.reference_id,
              metadata: activity.metadata,
              actor_admin_name: activity.actor_admin&.name,
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
              no_show_count: player.no_show_count.to_i,
              cancellation_count: player.cancellation_count.to_i,
              player_score: score&.total_score.to_i,
              score_breakdown: {
                engagement_score: score&.engagement_score.to_i,
                activity_score: score&.activity_score.to_i,
                frequency_score: score&.frequency_score.to_i,
                reliability_score: score&.reliability_score.to_i
              },
              behavior_flags: flags,
              tags: player.tags || [],
              activities_meta: {
                page: activity_page,
                per_page: activity_per_page,
                total_count: total_activities,
                total_pages: total_activity_pages,
                has_more: activity_page < total_activity_pages
              },
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
