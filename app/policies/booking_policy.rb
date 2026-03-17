class BookingPolicy < ApplicationPolicy
  def update?
    own_branch?
  end
end
