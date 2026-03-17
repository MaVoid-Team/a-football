module Api
  module Admin
    class AdminsController < BaseController
      def index
        admins = policy_scope(::Admin)
        admins = admins.where(branch_id: params[:branch_id]) if params[:branch_id].present?
        admins = admins.where(role: params[:role]) if params[:role].present?
        admins = apply_sort(admins, { "email" => :email, "created_at" => :created_at }, { email: :asc })

        result = search_with_pagination(::Admin, admins, build_admin_filter)
        render json: AdminSerializer.new(result).serializable_hash, status: :ok
      end

      def create
        admin = ::Admin.new(admin_params)
        authorize admin
        admin.save!
        render json: AdminSerializer.new(admin).serializable_hash, status: :created
      end

      def update
        admin = ::Admin.find(params[:id])
        authorize admin
        admin.update!(admin_params)
        render json: AdminSerializer.new(admin).serializable_hash, status: :ok
      end

      def destroy
        admin = ::Admin.find(params[:id])
        authorize admin
        admin.destroy!
        head :no_content
      end

      private

      def admin_params
        params.require(:admin).permit(:branch_id, :email, :password, :password_confirmation, :role)
      end

      def build_admin_filter
        parts = []
        parts << "branch_id = #{params[:branch_id].to_i}" if params[:branch_id].present?
        parts << "role = #{params[:role].to_i}" if params[:role].present?
        build_meilisearch_filter(parts)
      end
    end
  end
end
