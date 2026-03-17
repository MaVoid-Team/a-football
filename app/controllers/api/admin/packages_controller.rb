module Api
  module Admin
    class PackagesController < BaseController
      def index
        packages = policy_scope(Package)
        packages = packages.for_branch(params[:branch_id]) if params[:branch_id].present?
        packages = packages.price_in_range(params[:price_min], params[:price_max])
        packages = apply_sort(packages, { "title" => :title, "price" => :price, "created_at" => :created_at }, { created_at: :desc })

        result = search_with_pagination(Package, packages, build_package_filter)
        render json: PackageSerializer.new(result).serializable_hash, status: :ok
      end

      def show
        package = Package.find(params[:id])
        authorize package
        render json: PackageSerializer.new(package).serializable_hash, status: :ok
      end

      def create
        package = Package.new(package_params)
        authorize package
        package.save!
        render json: PackageSerializer.new(package).serializable_hash, status: :created
      end

      def update
        package = Package.find(params[:id])
        authorize package
        package.update!(package_params)
        render json: PackageSerializer.new(package).serializable_hash, status: :ok
      end

      def destroy
        package = Package.find(params[:id])
        authorize package
        package.destroy!
        head :no_content
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

      def package_params
        params.require(:package).permit(:branch_id, :title, :description, :price)
      end
    end
  end
end
