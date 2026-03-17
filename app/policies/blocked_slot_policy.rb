class BlockedSlotPolicy < ApplicationPolicy
  def create?
    own_branch?
  end

  def update?
    own_branch?
  end

  def destroy?
    own_branch?
  end
end
