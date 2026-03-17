module Api
  module Admin
    class BranchesController < BaseController
      def index
        branches = policy_scope(Branch)
        branches = branches.active_filter(params[:active]) if params[:active].present?
        branches = apply_sort(branches, { "name" => :name, "created_at" => :created_at }, { name: :asc })

        result = search_with_pagination(Branch, branches, build_branch_filter)
        render json: BranchSerializer.new(result).serializable_hash, status: :ok
      end

      def show
        branch = Branch.find(params[:id])
        authorize branch
        render json: BranchSerializer.new(branch).serializable_hash, status: :ok
      end

      def create
        branch = Branch.new(branch_params)
        authorize branch
        branch.save!
        render json: BranchSerializer.new(branch).serializable_hash, status: :created
      end

      def update
        branch = Branch.find(params[:id])
        authorize branch
        branch.update!(branch_params)
        render json: BranchSerializer.new(branch).serializable_hash, status: :ok
      end

      def destroy
        branch = Branch.find(params[:id])
        authorize branch
        branch.destroy!
        head :no_content
      end

      private

      def branch_params
        params.require(:branch).permit(:name, :address, :timezone, :active)
      end

      def build_branch_filter
        parts = []
        parts << "active = #{params[:active].to_s.downcase == 'true'}" if params[:active].present?
        build_meilisearch_filter(parts)
      end
    end
  end
end
