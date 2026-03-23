class PackageRequestPolicy < ApplicationPolicy
  def show?
    return true if super_admin?
    admin.branch_id == record.branch_id
  end

  def update?
    return true if super_admin?
    admin.branch_id == record.branch_id
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if admin.super_admin?
        scope.all
      else
        scope.where(branch_id: admin.branch_id)
      end
    end
  end
end
