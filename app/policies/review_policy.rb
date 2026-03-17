class ReviewPolicy < ApplicationPolicy
  def destroy?
    own_branch?
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
