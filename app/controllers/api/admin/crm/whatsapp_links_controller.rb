module Api
  module Admin
    module Crm
      class WhatsappLinksController < BaseController
        def create
          template = scoped_templates.active_only.find(params[:template_id])
          _player_type, player = find_player!(params[:player_key])

          branch_name =
            if current_admin.branch_id.present?
              Branch.find_by(id: current_admin.branch_id)&.name
            end

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
              player_key: params[:player_key],
              template_id: template.id,
              message: rendered,
              whatsapp_link: link
            }
          }, status: :ok
        end

        private

        def last_played_days(player)
          return "N/A" if player.last_activity_date.blank?

          ((Time.current - player.last_activity_date) / 1.day).floor.to_s
        end
      end
    end
  end
end
