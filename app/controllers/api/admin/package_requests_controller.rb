module Api
  module Admin
    class PackageRequestsController < BaseController
      def index
        requests = policy_scope(PackageRequest)
        requests = requests.for_branch(params[:branch_id]) if params[:branch_id].present?
        requests = requests.by_status(params[:status]) if params[:status].present?
        requests = requests.recent_first

        render json: PackageRequestSerializer.new(requests).serializable_hash, status: :ok
      end

      def show
        request = PackageRequest.find(params[:id])
        authorize request
        render json: PackageRequestSerializer.new(request).serializable_hash, status: :ok
      end

      def update
        request = PackageRequest.find(params[:id])
        authorize request
        request.update!(package_request_update_params)
        render json: PackageRequestSerializer.new(request).serializable_hash, status: :ok
      end

      private

      def package_request_update_params
        params.require(:package_request).permit(:status)
      end
    end
  end
end
