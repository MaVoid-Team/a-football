class SettingPolicy < ApplicationPolicy
  def show?
    own_branch?
  end

  def create?
    own_branch?
  end

  def update?
    own_branch?
  end
end
