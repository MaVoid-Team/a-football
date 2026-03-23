class TournamentPolicy < ApplicationPolicy
  def create?
    own_branch?
  end

  def update?
    own_branch?
  end

  def destroy?
    own_branch?
  end

  def start?
    update?
  end

  def generate_bracket?
    update?
  end

  def bracket?
    show?
  end

  class Scope < Scope
    def resolve
      if admin.super_admin?
        scope.all
      else
        scope.where(branch_id: admin.branch_id)
      end
    end
  end
end
