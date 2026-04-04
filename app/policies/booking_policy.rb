class BookingPolicy < ApplicationPolicy
  def update?
    own_branch?
  end

  def destroy?
    own_branch?
  end
end
