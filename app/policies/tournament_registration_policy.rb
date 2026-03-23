class TournamentRegistrationPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if admin.super_admin?
        scope.all
      else
        scope.joins(:tournament).where(tournaments: { branch_id: admin.branch_id })
      end
    end
  end
end
