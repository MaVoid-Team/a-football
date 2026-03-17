module Api
  class PackagesController < BaseController
    def index
      packages = if params[:branch_id].present?
        Package.for_branch(params[:branch_id])
      else
        Package.all # Get all packages (both global and branch-specific)
      end
      
      packages = packages.price_in_range(params[:price_min], params[:price_max])
      packages = apply_sort(packages, { "title" => :title, "price" => :price, "created_at" => :created_at }, { created_at: :desc })

      result = search_with_pagination(Package, packages, build_package_filter)
      render json: PackageSerializer.new(result).serializable_hash, status: :ok
    end

    def show
      package = Package.find(params[:id])
      render json: PackageSerializer.new(package).serializable_hash, status: :ok
    end

    private

    def build_package_filter
      parts = []
      if params[:branch_id].present?
        bid = params[:branch_id].to_i
        parts << "(branch_id = #{bid} OR branch_id IS NULL)"
      end
      parts << "price >= #{params[:price_min].to_f}" if params[:price_min].present?
      parts << "price <= #{params[:price_max].to_f}" if params[:price_max].present?
      build_meilisearch_filter(parts)
    end
  end
end
