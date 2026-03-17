module Api
  module Admin
    class BaseController < Api::BaseController
      include Authenticatable
      include Pundit::Authorization

      def pundit_user
        current_admin
      end

      after_action :verify_authorized, except: :index
      after_action :verify_policy_scoped, only: :index
    end
  end
end
