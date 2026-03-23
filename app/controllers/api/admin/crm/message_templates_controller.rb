module Api
  module Admin
    module Crm
      class MessageTemplatesController < BaseController
        def index
          templates = scoped_templates.order(:name)
          render json: {
            data: templates.map { |template| serialize_template(template) }
          }, status: :ok
        end

        def create
          template = scoped_templates.new(template_params)
          template.branch_id ||= current_admin.branch_id if current_admin.branch_admin?

          template.save!
          render json: { data: serialize_template(template) }, status: :created
        end

        def update
          template = scoped_templates.find(params[:id])
          template.update!(template_params)
          render json: { data: serialize_template(template) }, status: :ok
        end

        private

        def template_params
          params.require(:message_template).permit(:name, :content, :whatsapp_number, :active, :branch_id)
        end

        def serialize_template(template)
          {
            id: template.id,
            name: template.name,
            content: template.content,
            whatsapp_number: template.whatsapp_number,
            active: template.active,
            branch_id: template.branch_id
          }
        end
      end
    end
  end
end
