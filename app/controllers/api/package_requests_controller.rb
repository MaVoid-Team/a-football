module Api
  class PackageRequestsController < BaseController
    def create
      package_request = PackageRequest.new(package_request_params)
      package_request.save!
      render json: PackageRequestSerializer.new(package_request).serializable_hash, status: :created
    end

    private

    def package_request_params
      params.require(:package_request).permit(:package_id, :branch_id, :customer_name, :customer_email, :customer_phone, :special_needs)
    end
  end
end
