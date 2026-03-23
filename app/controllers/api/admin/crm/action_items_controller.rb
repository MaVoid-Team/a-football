module Api
  module Admin
    module Crm
      class ActionItemsController < BaseController
        def index
          items = scoped_action_items
                  .for_status(params[:status])
                  .recent_first

          items = items.where(player_type: params[:player_type], player_id: params[:player_id]) if params[:player_type].present? && params[:player_id].present?

          render json: {
            data: items.limit(200).map { |item| serialize_item(item) }
          }, status: :ok
        end

        def update
          item = scoped_action_items.find(params[:id])
          status = params[:status].to_s

          case status
          when "completed"
            item.complete!(current_admin)
          when "ignored"
            item.ignore!(current_admin)
          else
            render json: { errors: ["Invalid status. Use completed or ignored"] }, status: :unprocessable_entity
            return
          end

          render json: { data: serialize_item(item.reload) }, status: :ok
        end

        def whatsapp_link
          item = scoped_action_items.find(params[:id])
          template = item.suggested_template || scoped_templates.active_only.find(params[:template_id])
          player_type, player = find_player!("#{item.player_type}-#{item.player_id}")

          branch_name = Branch.find_by(id: item.branch_id || current_admin.branch_id)&.name
          rendered = ::Crm::TemplateRenderer.new(
            content: template.content,
            variables: {
              "name" => player.name,
              "club_name" => branch_name.to_s,
              "last_played_days" => last_played_days(player),
              "total_matches" => player.total_matches.to_i,
              "next_available_slot" => params[:next_available_slot].to_s,
              "tournament_name" => params[:tournament_name].to_s
            }
          ).call

          link = ::Crm::WhatsappLinkBuilder.new(phone: template.whatsapp_number, message: rendered).call

          render json: {
            data: {
              action_item_id: item.id,
              player_key: "#{player_type}-#{player.id}",
              template_id: template.id,
              message: rendered,
              whatsapp_link: link
            }
          }, status: :ok
        end

        def bulk_whatsapp_links
          segment = scoped_segments.active_only.find(params[:segment_id])
          template = scoped_templates.active_only.find(params[:template_id])

          memberships = SegmentMembership.for_segment(segment.id).limit(500)
          data = memberships.map do |membership|
            player = membership.player_type.constantize.find_by(id: membership.player_id)
            next nil if player.blank?

            rendered = ::Crm::TemplateRenderer.new(
              content: template.content,
              variables: {
                "name" => player.name,
                "club_name" => Branch.find_by(id: membership.branch_id || current_admin.branch_id)&.name.to_s,
                "last_played_days" => last_played_days(player),
                "total_matches" => player.total_matches.to_i,
                "next_available_slot" => params[:next_available_slot].to_s,
                "tournament_name" => params[:tournament_name].to_s
              }
            ).call

            {
              player_key: "#{membership.player_type}-#{membership.player_id}",
              message: rendered,
              whatsapp_link: ::Crm::WhatsappLinkBuilder.new(phone: template.whatsapp_number, message: rendered).call
            }
          end.compact

          render json: {
            data: data,
            meta: {
              segment_id: segment.id,
              template_id: template.id,
              total: data.size
            }
          }, status: :ok
        end

        private

        def serialize_item(item)
          {
            id: item.id,
            player_type: item.player_type,
            player_id: item.player_id,
            reason: item.reason,
            status: item.status,
            automation_rule_id: item.automation_rule_id,
            suggested_template_id: item.suggested_template_id,
            acted_by_admin_id: item.acted_by_admin_id,
            completed_at: item.completed_at,
            ignored_at: item.ignored_at,
            created_at: item.created_at
          }
        end

        def last_played_days(player)
          return "N/A" if player.last_activity_date.blank?

          ((Time.current - player.last_activity_date) / 1.day).floor.to_s
        end
      end
    end
  end
end
