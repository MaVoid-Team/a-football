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
              "club_name" => branch_name.to_s
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
      end
    end
  end
end
