class PackagePolicy < ApplicationPolicy
  def create?
    own_branch? || super_admin?
  end

  def update?
    return true if super_admin?
    own_branch?
  end

  def destroy?
    return true if super_admin?
    own_branch?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if admin.super_admin?
        scope.all
      else
        scope.where(branch_id: [admin.branch_id, nil])
      end
    end
  end
end
