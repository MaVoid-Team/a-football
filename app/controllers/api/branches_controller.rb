module Api
  class BranchesController < ApplicationController
    def index
      branches = Branch.active
      render json: BranchSerializer.new(branches).serializable_hash, status: :ok
    end

    def show
      branch = Branch.active.find(params[:id])
      render json: BranchSerializer.new(branch).serializable_hash, status: :ok
    end
  end
end
