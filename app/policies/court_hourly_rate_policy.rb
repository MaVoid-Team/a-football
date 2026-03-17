class CourtHourlyRatePolicy < ApplicationPolicy
  def show?
    own_court_branch?
  end

  def create?
    own_court_branch?
  end

  def update?
    own_court_branch?
  end

  def destroy?
    own_court_branch?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if admin.super_admin?
        scope.all
      else
        scope.joins(:court).where(courts: { branch_id: admin.branch_id })
      end
    end
  end

  private

  def own_court_branch?
    return true if super_admin?
    record.respond_to?(:court) && record.court&.branch_id == admin.branch_id
  end
end
