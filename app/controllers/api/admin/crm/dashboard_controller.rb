module Api
  module Admin
    module Crm
      class DashboardController < BaseController
        def index
          render json: ::Crm::DashboardQuery.new(admin: current_admin).call, status: :ok
        end
      end
    end
  end
end
