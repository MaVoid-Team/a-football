class AdminPolicy < ApplicationPolicy
  def index?
    admin.present?
  end

  def create?
    super_admin?
  end

  def update?
    super_admin?
  end

  def destroy?
    super_admin? && admin.id != record.id
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
