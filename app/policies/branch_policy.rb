class BranchPolicy < ApplicationPolicy
  def index?
    admin.present?
  end

  def show?
    own_branch?
  end

  def create?
    super_admin?
  end

  def update?
    own_branch?
  end

  def destroy?
    super_admin?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if admin.super_admin?
        scope.all
      else
        scope.where(id: admin.branch_id)
      end
    end
  end
end
